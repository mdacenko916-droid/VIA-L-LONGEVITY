package com.viael.healthconnect

import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import kotlin.reflect.KClass

/**
 * Локальный Health Connect плагин VIA·L (только Android).
 * Читает HRV(RMSSD) / пульс покоя / VO2max / SpO2 / шаги / сон(стадии) и
 * нормализует в те же поля, что и Apple-мост → healthconnect-bridge.js кормит их в шаги.
 */
@CapacitorPlugin(name = "HealthConnectVial")
class HealthConnectVialPlugin : Plugin() {

    // Разрешения на чтение наших типов (строки; getGrantedPermissions тоже отдаёт строки).
    private val perms: Set<String> = setOf(
        HealthPermission.getReadPermission(HeartRateVariabilityRmssdRecord::class),
        HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        HealthPermission.getReadPermission(Vo2MaxRecord::class),
        HealthPermission.getReadPermission(OxygenSaturationRecord::class),
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class)
    )

    private fun client(): HealthConnectClient? = try {
        if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE)
            HealthConnectClient.getOrCreate(context) else null
    } catch (e: Exception) {
        null
    }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val status = try { HealthConnectClient.getSdkStatus(context) } catch (e: Exception) { -1 }
        val res = JSObject()
        res.put("available", status == HealthConnectClient.SDK_AVAILABLE)
        res.put(
            "status",
            when (status) {
                HealthConnectClient.SDK_AVAILABLE -> "available"
                HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "update_required"
                HealthConnectClient.SDK_UNAVAILABLE -> "unsupported"
                else -> "unknown"
            }
        )
        call.resolve(res)
    }

    @PluginMethod
    override fun requestPermissions(call: PluginCall) {
        val c = client() ?: run { call.reject("Health Connect unavailable"); return }
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val granted = c.permissionController.getGrantedPermissions()
                if (granted.containsAll(perms)) {
                    val r = JSObject(); r.put("granted", true); call.resolve(r); return@launch
                }
                val intent = PermissionController
                    .createRequestPermissionResultContract()
                    .createIntent(context, perms)
                activity.runOnUiThread { startActivityForResult(call, intent, "permsCallback") }
            } catch (e: Exception) {
                call.reject(e.message ?: "permission error")
            }
        }
    }

    @ActivityCallback
    fun permsCallback(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val c = client() ?: run { call.reject("Health Connect unavailable"); return }
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val granted = c.permissionController.getGrantedPermissions()
                val r = JSObject(); r.put("granted", granted.containsAll(perms)); call.resolve(r)
            } catch (e: Exception) {
                call.reject(e.message ?: "permission callback error")
            }
        }
    }

    @PluginMethod
    fun readMetrics(call: PluginCall) {
        val c = client() ?: run { call.reject("Health Connect unavailable"); return }
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val now = Instant.now()
                val from7 = now.minus(Duration.ofDays(7))
                val out = JSObject()

                // ── Сон: последняя ночь (стадии). Заодно — окно сна для усреднения HRV. ──
                var nightStart: Instant? = null
                var nightEnd: Instant? = null
                val sessions = readRecords(c, SleepSessionRecord::class, now.minus(Duration.ofDays(2)), now)
                val lastSession = sessions.maxByOrNull { it.endTime }
                if (lastSession != null) {
                    nightStart = lastSession.startTime
                    nightEnd = lastSession.endTime
                    var asleepSec = 0.0
                    var deepSec = 0.0
                    if (lastSession.stages.isNotEmpty()) {
                        for (st in lastSession.stages) {
                            val sec = Duration.between(st.startTime, st.endTime).seconds.toDouble()
                            if (sec <= 0) continue
                            when (st.stage) {
                                SleepSessionRecord.STAGE_TYPE_DEEP -> { deepSec += sec; asleepSec += sec }
                                SleepSessionRecord.STAGE_TYPE_LIGHT,
                                SleepSessionRecord.STAGE_TYPE_REM,
                                SleepSessionRecord.STAGE_TYPE_SLEEPING -> asleepSec += sec
                                else -> {} // AWAKE / OUT_OF_BED / IN_BED — не считаем сном
                            }
                        }
                    } else {
                        // Нет разметки стадий — берём длительность сессии целиком.
                        asleepSec = Duration.between(lastSession.startTime, lastSession.endTime).seconds.toDouble()
                    }
                    if (asleepSec > 0) out.put("sleepHours", Math.round(asleepSec / 360.0) / 10.0) // часы, 1 знак
                    if (deepSec > 0) out.put("deepMin", Math.round(deepSec / 60.0).toInt())
                }

                // ── HRV (RMSSD): среднее по сэмплам внутри окна сна, иначе последний. ──
                val hrvAll = readRecords(c, HeartRateVariabilityRmssdRecord::class, from7, now)
                if (hrvAll.isNotEmpty()) {
                    val inWindow = if (nightStart != null && nightEnd != null)
                        hrvAll.filter { !it.time.isBefore(nightStart) && !it.time.isAfter(nightEnd) }
                    else emptyList()
                    val hrv = if (inWindow.isNotEmpty())
                        inWindow.map { it.heartRateVariabilityMillis }.average()
                    else hrvAll.maxByOrNull { it.time }!!.heartRateVariabilityMillis
                    if (!hrv.isNaN()) out.put("hrv", Math.round(hrv).toInt())
                }

                // ── Пульс покоя: последний за 7 дней. ──
                readRecords(c, RestingHeartRateRecord::class, from7, now)
                    .maxByOrNull { it.time }?.let { out.put("rhr", it.beatsPerMinute.toInt()) }

                // ── VO2max: последний. ──
                readRecords(c, Vo2MaxRecord::class, from7, now)
                    .maxByOrNull { it.time }?.let { out.put("vo2", Math.round(it.vo2MillilitersPerMinuteKilogram).toInt()) }

                // ── SpO2: последний (percentage.value уже в %). ──
                readRecords(c, OxygenSaturationRecord::class, from7, now)
                    .maxByOrNull { it.time }?.let {
                        val v = it.percentage.value
                        if (v in 70.0..100.0) out.put("spo2", Math.round(v).toInt())
                    }

                // ── Шаги: сумма за последние сутки. ──
                val steps = readRecords(c, StepsRecord::class, now.minus(Duration.ofDays(1)), now)
                    .sumOf { it.count }
                if (steps > 0) out.put("steps", steps.toInt())

                call.resolve(out)
            } catch (e: Exception) {
                call.reject(e.message ?: "read error")
            }
        }
    }

    private suspend fun <T : Record> readRecords(
        c: HealthConnectClient,
        type: KClass<T>,
        start: Instant,
        end: Instant
    ): List<T> = c.readRecords(
        ReadRecordsRequest(recordType = type, timeRangeFilter = TimeRangeFilter.between(start, end))
    ).records
}

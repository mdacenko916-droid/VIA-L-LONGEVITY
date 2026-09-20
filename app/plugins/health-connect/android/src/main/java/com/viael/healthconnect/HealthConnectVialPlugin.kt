package com.viael.healthconnect

import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RespiratoryRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.WeightRecord
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
import java.time.LocalDate
import java.time.ZoneId
import com.getcapacitor.JSArray
import kotlin.reflect.KClass

/**
 * Локальный Health Connect плагин VIA·L (только Android).
 * Читает HRV(RMSSD) / пульс покоя / VO2max / SpO2 / шаги / сон(стадии) +
 * тренировки / дыхание / вес / давление (2026-09-18) + процент жира / глюкоза (2026-09-20) и
 * нормализует в те же поля, что и Apple-мост → healthconnect-bridge.js кормит их в шаги.
 */
@CapacitorPlugin(name = "HealthConnectVial")
class HealthConnectVialPlugin : Plugin() {

    // Разрешения на чтение наших типов (строки; getGrantedPermissions тоже отдаёт строки).
    // corePerms — то, без чего разбор не работает; «подключено» считаем по ним.
    private val corePerms: Set<String> = setOf(
        HealthPermission.getReadPermission(HeartRateVariabilityRmssdRecord::class),
        HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        // Обычный пульс: из него считаем пульс покоя, когда источник не пишет его отдельным
        // типом (мосты Fitbit→Health Connect пишут только HeartRateRecord).
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(Vo2MaxRecord::class),
        HealthPermission.getReadPermission(OxygenSaturationRecord::class),
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class)
    )
    // Полный приём (2026-09-18): тренировки, дыхание, вес, давление. Отказ по любому из них
    // не ломает остальное — каждый тип читается отдельно (safeRead).
    private val perms: Set<String> = corePerms + setOf(
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getReadPermission(RespiratoryRateRecord::class),
        HealthPermission.getReadPermission(WeightRecord::class),
        HealthPermission.getReadPermission(BloodPressureRecord::class),
        // 2026-09-20: состав тела (умные весы) и глюкоза (глюкометр/CGM). Тоже через safeRead.
        HealthPermission.getReadPermission(BodyFatRecord::class),
        HealthPermission.getReadPermission(BloodGlucoseRecord::class)
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
                val r = JSObject(); r.put("granted", granted.containsAll(corePerms)); call.resolve(r)
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

                // Фолбэк: тип «пульс покоя» пишут не все источники (мосты из Fitbit кладут только
                // обычный пульс) — тогда считаем сами по ночному пульсу внутри окна сна. Берём
                // 10-й перцентиль, а не минимум: одиночный артефакт замера не должен занижать
                // показатель на все сутки. То же правило, что в Apple-мосте.
                if (!out.has("rhr") && nightStart != null && nightEnd != null) {
                    val night = readRecords(c, HeartRateRecord::class, nightStart, nightEnd)
                        .flatMap { it.samples }
                        .filter { !it.time.isBefore(nightStart) && !it.time.isAfter(nightEnd) }
                        .map { it.beatsPerMinute }
                        .filter { it in 25..200 }
                        .sorted()
                    if (night.size >= 3) out.put("rhr", night[(night.size * 0.1).toInt()].toInt())
                }

                // ── VO2max: последний. ──
                readRecords(c, Vo2MaxRecord::class, from7, now)
                    .maxByOrNull { it.time }?.let { out.put("vo2", Math.round(it.vo2MillilitersPerMinuteKilogram).toInt()) }

                // ── SpO2: последний (percentage.value уже в %). ──
                readRecords(c, OxygenSaturationRecord::class, from7, now)
                    .maxByOrNull { it.time }?.let {
                        val v = it.percentage.value
                        if (v in 70.0..100.0) out.put("spo2", Math.round(v).toInt())
                    }

                // ── Шаги: сумма за ВЧЕРА (календарные сутки). Телефон и часы пишут шаги параллельно —
                // простая сумма считала бы их дважды; суммируем по источнику и берём самый полный. ──
                val zone = ZoneId.systemDefault()
                val today0 = LocalDate.now(zone).atStartOfDay(zone).toInstant()
                val yest0 = today0.minus(Duration.ofDays(1))
                val steps = safeRead(c, StepsRecord::class, yest0, today0)
                    .groupBy { it.metadata.dataOrigin.packageName }
                    .values.maxOfOrNull { l -> l.sumOf { it.count } } ?: 0L
                if (steps > 0) out.put("steps", steps.toInt())

                // ── Тренировки за 7 дней: день, вид, минуты. Сводку считает JS-мост
                // (_vialWorkoutSummary) по тем же правилам, что у вендоров. ──
                val wl = JSArray()
                safeRead(c, ExerciseSessionRecord::class, from7, now).forEach {
                    val mins = Duration.between(it.startTime, it.endTime).seconds / 60.0
                    if (mins > 0) {
                        val w = JSObject()
                        w.put("day", it.startTime.atZone(zone).toLocalDate().toString())
                        w.put("activity", exerciseName(it.exerciseType))
                        w.put("minutes", mins)
                        wl.put(w)
                    }
                }
                if (wl.length() > 0) out.put("workouts", wl)

                // ── Частота дыхания: среднее за сон (днём её искажает движение). ──
                if (nightStart != null && nightEnd != null) {
                    val rr = safeRead(c, RespiratoryRateRecord::class, nightStart, nightEnd).map { it.rate }
                    if (rr.isNotEmpty()) out.put("respRate", rr.average())
                }

                // ── Вес: последний за 7 дней (кг). Давление: последний замер за сутки (мм рт. ст.). ──
                safeRead(c, WeightRecord::class, from7, now).maxByOrNull { it.time }
                    ?.let { out.put("weight", it.weight.inKilograms) }
                safeRead(c, BloodPressureRecord::class, now.minus(Duration.ofDays(1)), now).maxByOrNull { it.time }
                    ?.let { out.put("bpSys", it.systolic.inMillimetersOfMercury); out.put("bpDia", it.diastolic.inMillimetersOfMercury) }

                // ── Процент жира: последний за 30 дней (весы — не ежедневная история). ──
                safeRead(c, BodyFatRecord::class, now.minus(Duration.ofDays(30)), now).maxByOrNull { it.time }
                    ?.let { val v = it.percentage.value; if (v in 3.0..70.0) out.put("bodyFat", Math.round(v * 10.0) / 10.0) }

                // ── Глюкоза: последний замер за 7 дней (ммоль/л). В отличие от Apple, Health Connect
                // хранит ОТНОШЕНИЕ К ЕДЕ — передаём его: натощак читается иначе, чем после еды. ──
                safeRead(c, BloodGlucoseRecord::class, from7, now).maxByOrNull { it.time }?.let {
                    val v = it.level.inMillimolesPerLiter
                    if (v in 2.0..30.0) {
                        out.put("glucose", Math.round(v * 10.0) / 10.0)
                        val meal = when (it.relationToMeal) {
                            BloodGlucoseRecord.RELATION_TO_MEAL_FASTING -> "fasting"
                            BloodGlucoseRecord.RELATION_TO_MEAL_BEFORE_MEAL -> "before_meal"
                            BloodGlucoseRecord.RELATION_TO_MEAL_AFTER_MEAL -> "after_meal"
                            else -> ""
                        }
                        if (meal.isNotEmpty()) out.put("glucoseMeal", meal)
                    }
                }

                call.resolve(out)
            } catch (e: Exception) {
                call.reject(e.message ?: "read error")
            }
        }
    }

    // Чтение типа, на который человек мог не дать разрешение: без разрешения Health Connect бросает
    // исключение, и раньше оно роняло ВЕСЬ импорт. Для новых типов — пусто вместо падения.
    private suspend fun <T : Record> safeRead(
        c: HealthConnectClient,
        type: KClass<T>,
        start: Instant,
        end: Instant
    ): List<T> = try { readRecords(c, type, start, end) } catch (e: Exception) { emptyList() }

    // Вид тренировки → те же слова, что у вендоров в воркере (strength / walking — фон и т.д.).
    private fun exerciseName(t: Int): String = when (t) {
        ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING,
        ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING,
        ExerciseSessionRecord.EXERCISE_TYPE_CALISTHENICS -> "strength_training"
        ExerciseSessionRecord.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING -> "hiit"
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING,
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL -> "running"
        ExerciseSessionRecord.EXERCISE_TYPE_WALKING -> "walking"
        ExerciseSessionRecord.EXERCISE_TYPE_HIKING -> "hiking"
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING,
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY -> "cycling"
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL,
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER -> "swimming"
        ExerciseSessionRecord.EXERCISE_TYPE_YOGA -> "yoga"
        ExerciseSessionRecord.EXERCISE_TYPE_PILATES -> "pilates"
        ExerciseSessionRecord.EXERCISE_TYPE_STRETCHING -> "stretching"
        ExerciseSessionRecord.EXERCISE_TYPE_ELLIPTICAL -> "elliptical"
        ExerciseSessionRecord.EXERCISE_TYPE_ROWING,
        ExerciseSessionRecord.EXERCISE_TYPE_ROWING_MACHINE -> "rowing"
        else -> "sport"
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

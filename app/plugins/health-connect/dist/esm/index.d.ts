export interface HealthConnectMetrics {
  hrv?: number;        // RMSSD, мс
  rhr?: number;        // пульс покоя, BPM
  vo2?: number;        // VO2max, mL/kg·min
  spo2?: number;       // SpO2, %
  steps?: number;      // шаги за сутки
  sleepHours?: number; // сон всего, часы
  deepMin?: number;    // глубокий сон, минуты
}

export interface HealthConnectVialPlugin {
  /** Доступен ли Health Connect на устройстве (установлен провайдер). */
  isAvailable(): Promise<{ available: boolean; status: string }>;
  /** Запрос разрешений на чтение наших типов (системный экран Health Connect). */
  requestPermissions(): Promise<{ granted: boolean }>;
  /** Чтение и нормализация метрик за последние 7 дней (сон — последняя ночь). */
  readMetrics(): Promise<HealthConnectMetrics>;
}

import { registerPlugin } from '@capacitor/core';
export declare const HealthConnectVial: ReturnType<typeof registerPlugin<HealthConnectVialPlugin>>;

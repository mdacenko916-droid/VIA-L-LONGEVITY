import { registerPlugin } from '@capacitor/core';
// Натив-реализация только под Android (см. android/). На web/iOS методы реджектят —
// healthconnect-bridge.js это ловит и тихо пропускает (как healthkit-bridge на вебе).
export const HealthConnectVial = registerPlugin('HealthConnectVial');

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var core = require('@capacitor/core');
// Натив-реализация только под Android (см. android/). На web/iOS методы реджектят.
const HealthConnectVial = core.registerPlugin('HealthConnectVial');
exports.HealthConnectVial = HealthConnectVial;

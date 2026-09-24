/* VIA·L — постоянный номер устройства (2026-09-24).
   Зачем: три пробных дня и суточный лимит считаются на сервере по полю `dev`. Прежде туда
   уходил только `cid` — случайная строка в памяти приложения, которая рождается заново после
   переустановки, и пробник таким образом обнулялся.
   Откуда берём:
     iOS     — связка ключей (родной модуль VialDeviceId в app/ios/App/App/VialDeviceId.swift):
               переживает удаление приложения, стирается только сбросом телефона.
     Android — системный SSAID через @capacitor/device: тоже переживает переустановку.
     Веб     — ничего: постоянного номера там нет, сервер считает по `cid`, как раньше.
   Номер ни с чем не связан: случайная строка, без имени, почты и кода доступа. В localStorage
   держим лишь копию, чтобы первый запрос дня не ждал платформу; источник правды — платформа. */
(function () {
  var KEY = 'vialp_dev', val = '';
  try { val = localStorage.getItem(KEY) || ''; } catch (e) {}

  window.vialDev = function () { return val || ''; };

  async function resolve() {
    try {
      var P = (window.Capacitor && window.Capacitor.Plugins) || {}, id = '';
      if (P.VialDeviceId && P.VialDeviceId.getId) {              // iOS: связка ключей
        var r = await P.VialDeviceId.getId(); id = (r && r.id) || '';
      } else if (P.Device && P.Device.getId) {                   // Android: SSAID
        var d = await P.Device.getId(); id = (d && (d.identifier || d.uuid)) || '';
      }
      if (id) { val = String(id).slice(0, 64); try { localStorage.setItem(KEY, val); } catch (e) {} }
    } catch (e) { /* нет номера — сервер посчитает по cid, как до этой правки */ }
  }

  if (window.Capacitor && window.Capacitor.Plugins) resolve();
})();

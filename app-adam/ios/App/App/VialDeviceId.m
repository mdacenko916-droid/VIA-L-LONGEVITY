#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Регистрация родного модуля в Capacitor: имя для JS — VialDeviceId (см. device-id.js).
CAP_PLUGIN(VialDeviceIdPlugin, "VialDeviceId",
           CAP_PLUGIN_METHOD(getId, CAPPluginReturnPromise);
)

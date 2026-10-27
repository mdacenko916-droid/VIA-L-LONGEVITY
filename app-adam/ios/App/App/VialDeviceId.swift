import Foundation
import Capacitor

/// Постоянный номер устройства для счёта пробных дней (2026-09-24).
/// Почему связка ключей, а не UserDefaults и не IDFV: и то и другое стирается вместе с
/// приложением, и три пробных дня возвращались переустановкой. Связка ключей переживает
/// удаление приложения и остаётся, пока человек не сбросит телефон целиком.
/// Номер ни с кем не связан: случайная строка, ни имени, ни почты, ни кода доступа.
@objc(VialDeviceIdPlugin)
public class VialDeviceIdPlugin: CAPPlugin {
    private let service = "com.viael.vial.deviceid"
    private let account = "vial-device-id"

    @objc func getId(_ call: CAPPluginCall) {
        if let saved = readId(), !saved.isEmpty {
            call.resolve(["id": saved])
            return
        }
        let fresh = UUID().uuidString.lowercased().replacingOccurrences(of: "-", with: "")
        writeId(fresh)
        call.resolve(["id": fresh])
    }

    private func query() -> [String: Any] {
        return [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
    }

    private func readId() -> String? {
        var q = query()
        q[kSecReturnData as String] = true
        q[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &item) == errSecSuccess,
              let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func writeId(_ value: String) {
        SecItemDelete(query() as CFDictionary)
        var q = query()
        q[kSecValueData as String] = value.data(using: .utf8)
        // Доступен после первой разблокировки: напоминания и фоновые задачи читают его без экрана.
        q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(q as CFDictionary, nil)
    }
}

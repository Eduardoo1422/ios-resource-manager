import Foundation

class DeviceService {
    static let shared = DeviceService()
    private init() {}

    func getOrGenerateDeviceUUID() -> String {
        if let storedData = KeychainHelper.shared.load(key: "deviceUUID"),
           let uuid = String(data: storedData, encoding: .utf8) {
            return uuid
        }
        
        let newUUID = UUID().uuidString
        if let data = newUUID.data(using: .utf8) {
            KeychainHelper.shared.save(key: "deviceUUID", data: data)
        }
        return newUUID
    }
}

import Foundation

class LicenseService {
    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func activate(key: String) async throws -> LicenseKey {
        let body = try JSONEncoder().encode([
            "key": key,
            "hardwareUuid": DeviceService.shared.getOrGenerateDeviceUUID(),
            "deviceName": UIDevice.current.name
        ])
        return try await apiClient.request(endpoint: "/activate", method: "POST", body: body)
    }
}

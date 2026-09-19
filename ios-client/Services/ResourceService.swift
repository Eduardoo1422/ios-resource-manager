import Foundation

class ResourceService {
    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    func fetchResources() async throws -> [Resource] {
        return try await apiClient.request(endpoint: "/resources")
    }

    func downloadResource(resourceId: String) async throws -> Data {
        return try await apiClient.request(endpoint: "/resources/\(resourceId)/download")
    }
}

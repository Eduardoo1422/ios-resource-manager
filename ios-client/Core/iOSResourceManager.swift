import Foundation

class iOSResourceManager {
    static let shared = iOSResourceManager()
    
    private(set) var apiClient: APIClient?
    private(set) var licenseService: LicenseService?
    private(set) var resourceService: ResourceService?
    
    private init() {}
    
    func configure(with baseURL: String) {
        let apiClient = APIClient(baseURL: baseURL)
        self.apiClient = apiClient
        self.licenseService = LicenseService(apiClient: apiClient)
        self.resourceService = ResourceService(apiClient: apiClient)
    }
}

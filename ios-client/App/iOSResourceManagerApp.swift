import SwiftUI

@main
struct iOSResourceManagerApp: App {
    @State private var isAuthenticated = false

    init() {
        let baseURL = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String
            ?? "http://localhost:3000/api"
        iOSResourceManager.shared.configure(with: baseURL)
    }

    var body: some Scene {
        WindowGroup {
            if isAuthenticated {
                if let resourceService = iOSResourceManager.shared.resourceService {
                    ResourceListView(resourceService: resourceService)
                } else {
                    Text("Resource service is not configured.")
                }
            } else {
                LoginView(onLoginSuccess: {
                    isAuthenticated = true
                })
            }
        }
    }
}

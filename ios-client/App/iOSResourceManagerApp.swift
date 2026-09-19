import SwiftUI

@main
struct iOSResourceManagerApp: App {
    @State private var isAuthenticated = false
    
    var body: some Scene {
        WindowGroup {
            if isAuthenticated {
                ResourceListView()
            } else {
                LoginView(onLoginSuccess: {
                    isAuthenticated = true
                })
            }
        }
    }
}

import SwiftUI

struct LoginView: View {
    @State private var licenseKey = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        VStack {
            TextField("Enter License Key", text: $licenseKey)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding()
            
            Button("Activate") {
                activate()
            }
            .disabled(isLoading)
            .padding()
            
            if isLoading {
                ProgressView()
            }
            
            if let error = errorMessage {
                Text(error).foregroundColor(.red)
            }
        }
    }
    
    private func activate() {
        guard let licenseService = iOSResourceManager.shared.licenseService else { return }
        isLoading = true
        errorMessage = nil
        Task {
            do {
                _ = try await licenseService.activate(key: licenseKey)
                // Handle navigation to main app
            } catch {
                errorMessage = "Activation failed: \(error.localizedDescription)"
            }
            isLoading = false
        }
    }
}

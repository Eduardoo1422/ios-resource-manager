import SwiftUI

struct LoginView: View {
    @State private var urlString = "http://localhost:3000/api/client"
    @State private var key = ""
    @State private var isLoggingIn = false
    @State private var errorMessage: String?
    
    var onLoginSuccess: () -> Void
    
    var body: some View {
        Form {
            TextField("URL do Servidor", text: $urlString)
            TextField("Chave de Acesso", text: $key)
            
            Button("Autenticar") {
                login()
            }
            .disabled(isLoggingIn)
            
            if let errorMessage = errorMessage {
                Text(errorMessage).foregroundColor(.red)
            }
        }
    }
    
    func login() {
        isLoggingIn = true
        APIClient.shared.baseURL = urlString
        APIClient.shared.activate(key: key, hardwareUuid: UIDevice.current.identifierForVendor?.uuidString ?? "unknown", deviceName: UIDevice.current.name) { result in
            DispatchQueue.main.async {
                isLoggingIn = false
                switch result {
                case .success:
                    onLoginSuccess()
                case .failure(let error):
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

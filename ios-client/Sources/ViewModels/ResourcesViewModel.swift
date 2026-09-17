import Foundation

class ResourcesViewModel: ObservableObject {
    @Published var resources: [Resource] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let managementService = ResourceManagementService()
    
    func fetchResources() {
        isLoading = true
        errorMessage = nil
        APIClient.shared.listResources { result in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success(let resources):
                    self.resources = resources
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func download(id: String) {
        APIClient.shared.downloadResource(id: id) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let url):
                    print("Download concluído: \(url)")
                case .failure(let error):
                    self.errorMessage = "Erro no download: \(error.localizedDescription)"
                }
            }
        }
    }
    
    func applyResource(resource: Resource) {
        guard let version = resource.currentVersion else {
            self.errorMessage = "Nenhuma versão disponível para este recurso."
            return
        }
        
        isLoading = true
        managementService.apply(resource: resource, version: version) { result in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success:
                    print("Recurso aplicado com sucesso.")
                case .unauthorized:
                    self.errorMessage = "Acesso não autorizado ao recurso."
                case .validationFailed(let msg):
                    self.errorMessage = "Falha na validação: \(msg)"
                case .backupFailed:
                    self.errorMessage = "Falha ao criar backup."
                case .operationFailed(let msg):
                    self.errorMessage = "Erro na operação: \(msg)"
                case .unsupported:
                    self.errorMessage = "Operação não suportada."
                }
            }
        }
    }
}

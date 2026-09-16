import Foundation

class ResourcesViewModel: ObservableObject {
    @Published var resources: [Resource] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
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
}

import Foundation

class ResourcesViewModel: ObservableObject {
    @Published var resources: [Resource] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let resourceService: ResourceService
    
    init(resourceService: ResourceService) {
        self.resourceService = resourceService
    }
    
    @MainActor
    func fetchResources() async {
        isLoading = true
        errorMessage = nil
        do {
            self.resources = try await resourceService.fetchResources()
        } catch {
            errorMessage = "Failed to fetch resources: \(error.localizedDescription)"
        }
        isLoading = false
    }
}

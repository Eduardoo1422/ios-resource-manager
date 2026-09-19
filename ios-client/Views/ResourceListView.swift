import SwiftUI

struct ResourceListView: View {
    @StateObject private var viewModel: ResourcesViewModel
    
    init(resourceService: ResourceService) {
        _viewModel = StateObject(wrappedValue: ResourcesViewModel(resourceService: resourceService))
    }
    
    var body: some View {
        List(viewModel.resources) { resource in
            Text(resource.name)
        }
        .task {
            await viewModel.fetchResources()
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .alert(item: Binding<IdentifiableError?>(get: {
            viewModel.errorMessage.map { IdentifiableError(message: $0) }
        }, set: { _ in viewModel.errorMessage = nil })) { error in
            Alert(title: Text("Error"), message: Text(error.message))
        }
    }
}

struct IdentifiableError: Identifiable {
    let id = UUID()
    let message: String
}

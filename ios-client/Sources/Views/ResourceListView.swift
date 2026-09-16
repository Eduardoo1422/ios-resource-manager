import SwiftUI

struct ResourceListView: View {
    @StateObject var viewModel = ResourcesViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.resources) { resource in
                HStack {
                    VStack(alignment: .leading) {
                        Text(resource.name).font(.headline)
                        Text(resource.status).font(.subheadline)
                    }
                    Spacer()
                    if resource.status == "ONLINE" {
                        Button("Download") {
                            viewModel.download(id: resource.id)
                        }
                    }
                }
            }
            .navigationTitle("Recursos")
            .toolbar {
                Button("Atualizar") { viewModel.fetchResources() }
            }
            .onAppear { viewModel.fetchResources() }
            .alert(item: Binding(get: { viewModel.errorMessage.map { IdentifiableError(message: $0) } }, set: { _ in viewModel.errorMessage = nil })) { error in
                Alert(title: Text("Erro"), message: Text(error.message))
            }
        }
    }
}

struct IdentifiableError: Identifiable {
    let id = UUID()
    let message: String
}

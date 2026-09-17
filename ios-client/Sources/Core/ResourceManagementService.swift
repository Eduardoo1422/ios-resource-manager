import Foundation

enum ResourceOperationResult {
    case success
    case unsupported
    case unauthorized
    case validationFailed(String)
    case backupFailed
    case operationFailed(String)
}

class ResourceManagementService {
    private let apiClient = APIClient.shared
    private let fileProvider: FileAccessProvider = SecureFileAccessProvider()
    private let backupManager = BackupManager()
    
    func apply(resource: Resource, version: ResourceVersion, completion: @escaping (ResourceOperationResult) -> Void) {
        // 1. Download
        apiClient.downloadResource(id: resource.id) { result in
            switch result {
            case .success(let tempURL):
                // 2. Validate Size & SHA-256
                do {
                    let isValid = try ResourceValidationService.validate(url: tempURL, expectedSize: version.fileSize, expectedSHA256: version.sha256)
                    guard isValid else {
                        completion(.validationFailed("Hash ou tamanho inválido"))
                        return
                    }
                } catch {
                    completion(.validationFailed(error.localizedDescription))
                    return
                }
                
                // 3. Verify Access & Resolve Target
                guard let targetURL = self.fileProvider.getURL(for: resource.targetFilePath) else {
                    completion(.unauthorized)
                    return
                }
                
                // 4. Create Backup
                let backupPath: String?
                do {
                    backupPath = try self.backupManager.createBackup(for: resource.id, sourceURL: targetURL)
                } catch {
                    completion(.backupFailed)
                    return
                }
                
                // 5. Replace
                guard let data = try? Data(contentsOf: tempURL) else {
                    completion(.operationFailed("Falha ao ler arquivo baixado"))
                    return
                }
                let operation = FileOperation(type: .replace, targetPath: resource.targetFilePath, sourceData: data)
                
                do {
                    let success = try self.fileProvider.performOperation(operation)
                    guard success else {
                        throw FileAccessError.accessDenied
                    }
                    
                    // 6. Post-op Validation
                    let postOpValid = try ResourceValidationService.validate(url: targetURL, expectedSize: version.fileSize, expectedSHA256: version.sha256)
                    
                    if postOpValid {
                        completion(.success)
                    } else {
                        // Restore on validation fail
                        try? self.backupManager.restoreBackup(at: backupPath, to: targetURL)
                        completion(.operationFailed("Validação pós-operação falhou"))
                    }
                } catch {
                    // Restore on error
                    try? self.backupManager.restoreBackup(at: backupPath, to: targetURL)
                    completion(.operationFailed(error.localizedDescription))
                }
                
            case .failure(let error):
                completion(.operationFailed("Download falhou: \(error.localizedDescription)"))
            }
        }
    }
}

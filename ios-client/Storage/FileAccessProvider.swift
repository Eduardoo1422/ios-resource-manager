import Foundation
import CryptoKit

enum FileAccessError: Error {
    case unauthorized
    case unsupported
    case fileNotFound
    case accessDenied
    case pathTraversalDetected
}

protocol FileAccessProvider {
    func canAccess(path: String) -> Bool
    func performOperation(_ operation: FileOperation) throws -> Bool
    func getURL(for path: String) -> URL?
}

class SecureFileAccessProvider: FileAccessProvider {
    // Definimos uma raiz autorizada dentro do container do app
    private let authorizedRoot = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("AuthorizedResources").standardized

    init() {
        try? FileManager.default.createDirectory(at: authorizedRoot, withIntermediateDirectories: true)
    }

    func canAccess(path: String) -> Bool {
        return getURL(for: path) != nil
    }
    
    func getURL(for path: String) -> URL? {
        let url = authorizedRoot.appendingPathComponent(path).standardized
        
        // Verifica se a URL resultante está contida na raiz, considerando o separador de caminho
        if url.path.hasPrefix(authorizedRoot.path + "/") || url.path == authorizedRoot.path {
            return url
        }
        return nil
    }

    func performOperation(_ operation: FileOperation) throws -> Bool {
        guard let targetURL = getURL(for: operation.targetPath) else {
            throw FileAccessError.unauthorized
        }
        
        switch operation.type {
        case .replace:
            guard let data = operation.sourceData else { throw FileAccessError.accessDenied }
            try data.write(to: targetURL, options: .atomic)
            return true
        case .delete:
            try FileManager.default.removeItem(at: targetURL)
            return true
        }
    }
}

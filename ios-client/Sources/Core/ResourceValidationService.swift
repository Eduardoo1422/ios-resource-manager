import Foundation
import CryptoKit

class ResourceValidationService {
    
    static func calculateSHA256(for url: URL) throws -> String {
        let data = try Data(contentsOf: url)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
    
    static func validate(url: URL, expectedSize: Int, expectedSHA256: String) throws -> Bool {
        // Validate Size
        let attributes = try FileManager.default.attributesOfItem(atPath: url.path)
        let fileSize = attributes[.size] as? Int ?? 0
        if fileSize != expectedSize {
            return false
        }
        
        // Validate SHA256
        let calculatedSHA256 = try calculateSHA256(for: url)
        return calculatedSHA256 == expectedSHA256
    }
}

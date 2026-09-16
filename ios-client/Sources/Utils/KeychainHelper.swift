import Foundation
import Security

class KeychainHelper {
    static let shared = KeychainHelper()
    private init() {}

    func save(token: String, service: String, account: String) {
        let data = token.data(using: .utf8)!
        let query = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecValueData: data
        ] as [CFString : Any]
        
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func getToken(service: String, account: String) -> String? {
        let query = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne
        ] as [CFString : Any]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecSuccess, let data = dataTypeRef as? Data {
            return String(data: data, encoding: .utf8)
        }
        return nil
    }
}

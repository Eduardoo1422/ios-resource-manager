import Foundation

class APIClient {
    static let shared = APIClient()
    
    var baseURL: String = "http://localhost:3000/api/client"
    
    private let tokenKey = "com.iosresourcemanager.token"
    
    var token: String? {
        get {
            guard let data = KeychainHelper.standard.load(key: tokenKey) else { return nil }
            return String(data: data, encoding: .utf8)
        }
        set {
            if let token = newValue {
                if let data = token.data(using: .utf8) {
                    KeychainHelper.standard.save(key: tokenKey, data: data)
                }
            } else {
                KeychainHelper.standard.delete(key: tokenKey)
            }
        }
    }
    
    private init() {}
    
    func activate(key: String, hardwareUuid: String, deviceName: String, completion: @escaping (Result<AuthResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/activate") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["key": key, "hardwareUuid": hardwareUuid, "deviceName": deviceName]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, _, error in
            if let error = error { completion(.failure(error)); return }
            guard let data = data else { return }
            
            do {
                let response = try JSONDecoder().decode(AuthResponse.self, from: data)
                self.token = response.token
                completion(.success(response))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func listResources(completion: @escaping (Result<[Resource], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/resources") else { return }
        var request = URLRequest(url: url)
        if let token = token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        
        URLSession.shared.dataTask(with: request) { data, _, error in
            if let error = error { completion(.failure(error)); return }
            guard let data = data else { return }
            
            do {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                let resources = try decoder.decode([Resource].self, from: data)
                completion(.success(resources))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func downloadResource(id: String, completion: @escaping (Result<URL, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/resources/\(id)/download") else { return }
        var request = URLRequest(url: url)
        if let token = token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        
        URLSession.shared.downloadTask(with: request) { location, response, error in
            if let error = error { completion(.failure(error)); return }
            guard let location = location else { return }
            
            let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let destinationURL = documentsURL.appendingPathComponent(response?.suggestedFilename ?? "resource_\(id)")
            
            do {
                if FileManager.default.fileExists(atPath: destinationURL.path) {
                    try FileManager.default.removeItem(at: destinationURL)
                }
                try FileManager.default.moveItem(at: location, to: destinationURL)
                completion(.success(destinationURL))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

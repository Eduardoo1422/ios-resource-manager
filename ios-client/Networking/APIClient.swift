import Foundation

enum APIError: Error {
    case unauthorized
    case forbidden
    case notFound
    case tooManyRequests
    case serverError
    case decodingError
    case invalidURL
}

class APIClient {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: String) {
        self.baseURL = URL(string: baseURL)!
        self.session = URLSession.shared
    }

    func request<T: Decodable>(endpoint: String, method: String = "GET", body: Data? = nil) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
        request.httpMethod = method
        request.httpBody = body
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainHelper.shared.load(key: "authToken") {
            request.addValue("Bearer \(String(data: token, encoding: .utf8)!)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError
        }

        switch httpResponse.statusCode {
        case 200...299:
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(T.self, from: data)
        case 401: throw APIError.unauthorized
        case 403: throw APIError.forbidden
        case 404: throw APIError.notFound
        case 429: throw APIError.tooManyRequests
        default: throw APIError.serverError
        }
    }
}

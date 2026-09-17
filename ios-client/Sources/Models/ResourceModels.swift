import Foundation

struct Resource: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let bundleId: String
    let targetFilePath: String
    let targetFilename: String
    let status: String
    let currentVersion: ResourceVersion?
}

struct ResourceVersion: Codable {
    let id: String
    let version: String
    let fileUrl: String
    let sha256: String
    let fileSize: Int
    let createdAt: Date
}

struct AuthResponse: Codable {
    let token: String
    let status: String
}

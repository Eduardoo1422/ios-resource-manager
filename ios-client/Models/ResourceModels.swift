import Foundation

struct Resource: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let bundleId: String
    let status: String
    let currentVersionId: String?
}

struct ResourceVersion: Codable, Identifiable {
    let id: String
    let resourceId: String
    let version: String
    let fileUrl: String
    let sha256: String
    let fileSize: Int
}

struct LicenseKey: Codable, Identifiable {
    let id: String
    let keyString: String
    let validUntil: Date
    let isActive: Bool
}

struct LinkedDevice: Codable, Identifiable {
    let id: String
    let licenseId: String
    let hardwareUuid: String
    let deviceName: String
    let linkedAt: Date
}

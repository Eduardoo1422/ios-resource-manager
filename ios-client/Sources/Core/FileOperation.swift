import Foundation

struct FileOperation {
    let type: OperationType
    let targetPath: String
    let sourceData: Data?
    
    enum OperationType {
        case replace
        case delete
    }
}

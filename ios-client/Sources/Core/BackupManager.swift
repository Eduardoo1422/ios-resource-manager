import Foundation
import CryptoKit

class BackupManager {
    private let backupRoot = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("Backups").standardized
    
    init() {
        try? FileManager.default.createDirectory(at: backupRoot, withIntermediateDirectories: true)
    }
    
    func createBackup(for resourceId: String, sourceURL: URL) throws -> String? {
        // Se o arquivo original não existe, não há o que fazer backup.
        guard FileManager.default.fileExists(atPath: sourceURL.path) else {
            return nil
        }
        
        let resourceBackupDir = backupRoot.appendingPathComponent(resourceId)
        try FileManager.default.createDirectory(at: resourceBackupDir, withIntermediateDirectories: true)
        
        let backupFileURL = resourceBackupDir.appendingPathComponent("backup.bin")
        
        if FileManager.default.fileExists(atPath: backupFileURL.path) {
            try FileManager.default.removeItem(at: backupFileURL)
        }
        
        try FileManager.default.copyItem(at: sourceURL, to: backupFileURL)
        return backupFileURL.path
    }
    
    func restoreBackup(at backupPath: String?, to targetURL: URL) throws {
        guard let backupPath = backupPath, FileManager.default.fileExists(atPath: backupPath) else {
            // Se não havia backup, removemos o arquivo que tentamos instalar, se existir
            if FileManager.default.fileExists(atPath: targetURL.path) {
                try FileManager.default.removeItem(at: targetURL)
            }
            return
        }
        
        let backupURL = URL(fileURLWithPath: backupPath)
        
        if FileManager.default.fileExists(atPath: targetURL.path) {
            try FileManager.default.removeItem(at: targetURL)
        }
        
        try FileManager.default.copyItem(at: backupURL, to: targetURL)
    }
}

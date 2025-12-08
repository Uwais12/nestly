import Foundation
import ExpoModulesCore

public class ShareDataReader: Module {
  public func definition() -> ModuleDefinition {
    Name("ShareDataReader")
    
    // Read data from App Group UserDefaults
    Function("getSharedData") { (key: String, appGroupId: String) -> [[String: Any]]? in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        return nil
      }
      
      guard let data = userDefaults.data(forKey: key) else {
        return nil
      }
      
      do {
        // Try to decode as JSON array
        if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [[String: Any]] {
          return json
        }
      } catch {
        NSLog("[ShareDataReader] Error decoding JSON: \(error)")
      }
      
      return nil
    }
    
    // Clear shared data
    Function("clearSharedData") { (key: String, appGroupId: String) -> Void in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        return
      }
      userDefaults.removeObject(forKey: key)
      userDefaults.synchronize()
    }
  }
}


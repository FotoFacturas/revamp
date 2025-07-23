// src/utils/core/logger.js
class Logger {
  static log(tag, message, data = null) {
    if (__DEV__) {
      console.log(`[${tag}] ${message}`, data || '');
    }
  }
  
  static info(tag, message, data = null) {
    if (__DEV__) {
      console.log(`ℹ️ [${tag}] ${message}`, data || '');
    }
  }
  
  static success(tag, message, data = null) {
    if (__DEV__) {
      console.log(`✅ [${tag}] ${message}`, data || '');
    }
  }
  
  static warning(tag, message, data = null) {
    console.warn(`⚠️ [${tag}] ${message}`, data || '');
  }
  
  static error(tag, message, error = null) {
    console.error(`❌ [${tag}] ${message}`, error || '');
  }
}

export default Logger; 
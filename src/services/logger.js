// Centralized Logging Service for React App
// Sends logs to FastAPI backend for storage in files (local development)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGGING_ENABLED = import.meta.env.VITE_LOGGING_ENABLED !== 'false';
const LOGGING_LEVEL = import.meta.env.VITE_LOGGING_LEVEL || 'INFO';
const BATCH_SIZE = parseInt(import.meta.env.VITE_LOGGING_BATCH_SIZE) || 10;
const BATCH_INTERVAL = parseInt(import.meta.env.VITE_LOGGING_BATCH_INTERVAL) || 5000;

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor() {
    this.logQueue = [];
    this.userContext = {};
    this.batchTimer = null;
    this.currentLevel = LOG_LEVELS[LOGGING_LEVEL] || LOG_LEVELS.INFO;
    
    // Start batch timer
    this.startBatchTimer();
    
    // Send logs before page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  /**
   * Set user context (called after login)
   */
  setUser(userId, email) {
    this.userContext = { userId, email };
  }

  /**
   * Clear user context (called after logout)
   */
  clearUser() {
    this.userContext = {};
  }

  /**
   * Start batch timer to send logs periodically
   */
  startBatchTimer() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    
    this.batchTimer = setInterval(() => {
      this.flush();
    }, BATCH_INTERVAL);
  }

  /**
   * Create log entry
   */
  createLogEntry(level, category, message, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      source: 'frontend',
      category,
      message,
      user_id: this.userContext.userId || null,
      email: this.userContext.email || null,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      environment: import.meta.env.MODE || 'development'
    };
  }

  /**
   * Add log to queue
   */
  addToQueue(logEntry) {
    // Always log to console in development
    if (import.meta.env.DEV) {
      const emoji = {
        DEBUG: '🔍',
        INFO: 'ℹ️',
        WARN: '⚠️',
        ERROR: '❌'
      }[logEntry.level] || 'ℹ️';
      
      console.log(
        `${emoji} [${logEntry.category}] ${logEntry.message}`,
        logEntry.context
      );
    }

    // Add to queue for backend if enabled
    if (LOGGING_ENABLED && API_BASE_URL) {
      this.logQueue.push(logEntry);
      
      // Flush if queue is full
      if (this.logQueue.length >= BATCH_SIZE) {
        this.flush();
      }
    }
  }

  /**
   * Send logs to backend file logging endpoint
   */
  async flush() {
    if (this.logQueue.length === 0) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: logsToSend })
      });

      if (!response.ok) {
        // If logging endpoint fails, just log to console
        console.error('Failed to send logs to backend:', response.status);
      }
    } catch (error) {
      // Fail silently - don't break the app if logging fails
      console.error('Error sending logs:', error.message);
    }
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    return LOG_LEVELS[level] >= this.currentLevel;
  }

  /**
   * Debug level logging
   */
  debug(category, message, context = {}) {
    if (!this.shouldLog('DEBUG')) return;
    
    const logEntry = this.createLogEntry('DEBUG', category, message, context);
    this.addToQueue(logEntry);
  }

  /**
   * Info level logging
   */
  info(category, message, context = {}) {
    if (!this.shouldLog('INFO')) return;
    
    const logEntry = this.createLogEntry('INFO', category, message, context);
    this.addToQueue(logEntry);
  }

  /**
   * Warning level logging
   */
  warn(category, message, context = {}) {
    if (!this.shouldLog('WARN')) return;
    
    const logEntry = this.createLogEntry('WARN', category, message, context);
    this.addToQueue(logEntry);
  }

  /**
   * Error level logging
   */
  error(category, message, context = {}, error = null) {
    if (!this.shouldLog('ERROR')) return;
    
    const logEntry = this.createLogEntry('ERROR', category, message, {
      ...context,
      error_stack: error ? error.stack : null,
      error_message: error ? error.message : null
    });
    this.addToQueue(logEntry);
  }

  /**
   * Log API call
   */
  apiCall(method, endpoint, userId = null) {
    this.info('api', `${method} ${endpoint}`, {
      method,
      endpoint,
      userId
    });
  }

  /**
   * Log API response
   */
  apiResponse(method, endpoint, status, duration = null) {
    const level = status >= 400 ? 'ERROR' : 'INFO';
    const logMethod = level === 'ERROR' ? this.error.bind(this) : this.info.bind(this);
    
    logMethod('api', `${method} ${endpoint} - ${status}`, {
      method,
      endpoint,
      status,
      duration
    });
  }

  /**
   * Log API error
   */
  apiError(method, endpoint, error) {
    this.error('api', `${method} ${endpoint} failed`, {
      method,
      endpoint,
      error_message: error.message
    }, error);
  }

  /**
   * Log user action
   */
  userAction(action, component, details = {}) {
    this.info('user_action', `${component}: ${action}`, {
      action,
      component,
      ...details
    });
  }

  /**
   * Log authentication event
   */
  auth(event, details = {}) {
    this.info('auth', event, details);
  }

  /**
   * Log wallet operation
   */
  wallet(operation, walletId, details = {}) {
    this.info('wallet', operation, {
      wallet_id: walletId,
      ...details
    });
  }

  /**
   * Log transaction operation
   */
  transaction(operation, details = {}) {
    this.info('transaction', operation, details);
  }
}

// Create singleton instance
const logger = new Logger();

// Export logger instance
export default logger;

// Also export as named export for convenience
export { logger };


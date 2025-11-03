// Global Error Handler for React App
import logger from '../services/logger';

/**
 * Initialize global error handlers
 */
export function initializeErrorHandlers() {
  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    logger.error(
      'error',
      'Unhandled error occurred',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      event.error
    );
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(
      'error',
      'Unhandled promise rejection',
      {
        reason: event.reason?.toString()
      },
      event.reason instanceof Error ? event.reason : new Error(event.reason)
    );
  });

  console.log('✅ Global error handlers initialized');
}


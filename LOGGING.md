# Centralized Logging System

## Overview

This application uses a centralized logging system that collects logs from both the React frontend and FastAPI backend, storing them in files for local development. This provides a simple, self-hosted solution for debugging and monitoring.

---

## Architecture

```
┌─────────────┐
│  React App  │
│             │──┐
│ (Frontend)  │  │
└─────────────┘  │
                 │  HTTP POST
                 ├────────────> ┌──────────────┐     ┌──────────┐
┌─────────────┐  │              │   FastAPI    │────>│ Log Files│
│ FastAPI App │  │              │              │     │          │
│             │──┘              │ /api/logs/file│<────│ logs/    │
│ (Backend)   │                 └──────────────┘     └──────────┘
└─────────────┘
     │
     │  Direct Write
     └─────────────────────────>
```

---

## Frontend Logging

### Logger Service

Location: `src/services/logger.js`

The logger service provides a singleton instance that batches logs and sends them to the backend file logging endpoint.

#### Features

- **Batching**: Collects logs and sends them in batches (default: 10 logs or 5 seconds)
- **Console Fallback**: Always logs to console in development mode
- **User Context**: Automatically includes user_id and email after login
- **Auto-Flush**: Sends remaining logs before page unload
- **Error Handling**: Fails silently if logging endpoint is unavailable

### Usage

```javascript
import logger from '../services/logger';

// Set user context after login (done automatically in AuthContext)
logger.setUser(userId, email);

// Clear user context on logout (done automatically in AuthContext)
logger.clearUser();

// Debug logging
logger.debug('category', 'Debug message', { key: 'value' });

// Info logging
logger.info('category', 'Info message', { key: 'value' });

// Warning logging
logger.warn('category', 'Warning message', { key: 'value' });

// Error logging
logger.error('category', 'Error message', { key: 'value' }, error);

// Convenience methods
logger.apiCall('POST', '/api/endpoint', userId);
logger.apiResponse('POST', '/api/endpoint', 200, duration);
logger.apiError('POST', '/api/endpoint', error);
logger.userAction('button_click', 'ComponentName', { button: 'save' });
logger.auth('User logged in', { oauth_provider: 'google' });
logger.wallet('Wallet created', walletId, { name: 'My Wallet' });
logger.transaction('Transaction uploaded', { wallet_id: walletId });
```

### Log Categories

- **auth** - Authentication events (login, logout, registration)
- **api** - API calls, responses, and errors
- **wallet** - Wallet operations (create, delete, fetch)
- **transaction** - Transaction operations (upload, fetch)
- **user_action** - User interactions (button clicks, form submissions)
- **navigation** - Page navigation events
- **error** - Unhandled errors and exceptions
- **performance** - Performance metrics

### Configuration

Environment variables (`.env`):

```env
VITE_LOGGING_ENABLED=true          # Enable/disable logging
VITE_LOGGING_LEVEL=DEBUG           # DEBUG, INFO, WARN, ERROR
VITE_LOGGING_BATCH_SIZE=10         # Number of logs per batch
VITE_LOGGING_BATCH_INTERVAL=5000   # Milliseconds between batches
```

### Global Error Handlers

Location: `src/utils/errorHandler.js`

Automatically captures:
- Unhandled JavaScript errors
- Unhandled promise rejections

Initialized in `src/main.jsx`.

---

## Backend Logging

### Logging Endpoint

**POST `/api/logs/file`**

Receives logs from the frontend and stores them in files.

#### Request Format

```json
{
  "logs": [
    {
      "timestamp": "2025-01-15T10:30:00.000Z",
      "level": "INFO",
      "source": "frontend",
      "category": "transaction",
      "message": "Transaction upload started",
      "user_id": "68e619e3848c88e19bc78202",
      "email": "user@example.com",
      "context": {
        "component": "FinanceManager",
        "wallet_id": "...",
        "file_name": "transactions.csv"
      },
      "environment": "development"
    }
  ]
}
```

#### Response

```json
{
  "status": "success",
  "message": "10 logs saved successfully",
  "count": 10
}
```

### Log File Structure

**Directory**: `logs/`

```
logs/
├── frontend.log          # Frontend logs
├── backend.log           # Backend logs
├── combined.log          # All logs combined
└── errors.log            # Error logs only
```

### Log Format

Each log entry is written as a JSON line:

```json
{"timestamp":"2025-01-15T10:30:00.000Z","level":"INFO","source":"frontend","category":"transaction","message":"Transaction upload started","user_id":"68e619e3848c88e19bc78202","email":"user@example.com","context":{"component":"FinanceManager","wallet_id":"...","file_name":"transactions.csv"},"environment":"development"}
```

---

## Viewing Logs

### Option 1: Text Editors (Recommended for Local Development)

1. **VS Code**: Open `logs/` folder and view files
2. **Notepad++**: Open log files with syntax highlighting
3. **Tail Command**: Watch logs in real-time
   ```bash
   tail -f logs/frontend.log
   tail -f logs/combined.log
   ```

### Option 2: Command Line Tools

```bash
# View recent frontend logs
tail -n 50 logs/frontend.log

# View all errors
grep "ERROR" logs/combined.log

# View logs for specific user
grep "user_id.*68e619e3848c88e19bc78202" logs/combined.log

# View logs by category
grep "category.*transaction" logs/combined.log

# Count errors by category
grep "ERROR" logs/combined.log | grep -o "category.*[^,]*" | sort | uniq -c
```

### Option 3: Log Viewing Tools

1. **LogExpert** (Windows) - Free log viewer
2. **BareTail** (Windows) - Real-time log monitoring
3. **LogViewer** (Cross-platform) - JSON log viewer

### Option 4: Simple Scripts

Create a simple Python script to parse and filter logs:

```python
import json
import sys
from datetime import datetime

def parse_logs(filename, level=None, user_id=None, category=None):
    with open(filename, 'r') as f:
        for line in f:
            try:
                log = json.loads(line.strip())
                
                # Apply filters
                if level and log.get('level') != level:
                    continue
                if user_id and log.get('user_id') != user_id:
                    continue
                if category and log.get('category') != category:
                    continue
                
                # Pretty print
                timestamp = log.get('timestamp', '')
                level = log.get('level', '')
                source = log.get('source', '')
                category = log.get('category', '')
                message = log.get('message', '')
                
                print(f"{timestamp} [{level}] {source}:{category} - {message}")
                
            except json.JSONDecodeError:
                continue

# Usage
parse_logs('logs/combined.log', level='ERROR')
parse_logs('logs/frontend.log', user_id='68e619e3848c88e19bc78202')
```

---

## Common Queries

### Debugging User Issues

```bash
# See all actions for a specific user
grep "user_id.*USER_ID_HERE" logs/combined.log

# See user's errors
grep "user_id.*USER_ID_HERE" logs/combined.log | grep "ERROR"
```

### API Monitoring

```bash
# See all API errors
grep "category.*api" logs/combined.log | grep "ERROR"

# Count API calls by endpoint
grep "category.*api" logs/combined.log | grep -o "endpoint.*[^,]*" | sort | uniq -c
```

### Transaction Debugging

```bash
# See all transaction operations
grep "category.*transaction" logs/combined.log

# See failed transaction uploads
grep "category.*transaction" logs/combined.log | grep "ERROR"
```

### Performance Analysis

```bash
# Find slow API calls (if duration is logged)
grep "duration.*[0-9][0-9][0-9][0-9]" logs/combined.log
```

---

## Log Rotation

### Manual Rotation

```bash
# Archive old logs
mv logs/frontend.log logs/frontend.log.old
mv logs/backend.log logs/backend.log.old
mv logs/combined.log logs/combined.log.old

# Create new empty files
touch logs/frontend.log logs/backend.log logs/combined.log logs/errors.log
```

### Automatic Rotation (Linux/Mac)

Create a logrotate configuration:

```bash
# /etc/logrotate.d/kartay-logs
/path/to/your/project/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

---

## Best Practices

### 1. Log Levels

- **DEBUG**: Detailed information for debugging (development only)
- **INFO**: General informational messages
- **WARN**: Warning messages for potentially harmful situations
- **ERROR**: Error events that might still allow the app to continue

### 2. Context Information

Always include relevant context:
- User IDs for user-specific actions
- Resource IDs (wallet_id, transaction_id)
- Operation names
- Relevant parameters

### 3. Error Logging

When logging errors, always include:
- Error message
- Stack trace
- Context leading to the error
- User and resource information

### 4. Performance

- Use appropriate log levels (avoid DEBUG in production)
- Batch logs to reduce API calls
- Set reasonable retention policies
- Monitor log file sizes

### 5. Privacy

- Don't log sensitive data (passwords, tokens, full credit card numbers)
- User IDs and emails are OK for debugging
- Be careful with PII (Personally Identifiable Information)

---

## Troubleshooting

### Logs Not Appearing

1. Check that `VITE_LOGGING_ENABLED=true` in `.env`
2. Verify `VITE_API_BASE_URL` is correct
3. Check browser console for logger errors
4. Verify backend `/api/logs/file` endpoint is working
5. Check that `logs/` directory exists and is writable

### Too Many Logs

1. Increase `VITE_LOGGING_BATCH_SIZE` to reduce API calls
2. Increase `VITE_LOGGING_BATCH_INTERVAL` to batch for longer
3. Set `VITE_LOGGING_LEVEL=INFO` or `WARN` to reduce volume
4. Implement log rotation

### Performance Impact

1. Logging is asynchronous and shouldn't block the UI
2. Batching reduces network overhead
3. Logger fails silently if backend is unavailable
4. Consider disabling in production if needed

---

## Future Enhancements

### 1. Log Viewer UI

Create a simple web interface to view and search logs:
- Filter by level, category, user, date range
- Real-time log streaming
- Export to CSV

### 2. Alerting

Set up alerts for critical errors:
- Email notifications
- Slack webhooks
- SMS for critical failures

### 3. Analytics Dashboard

Create visualizations:
- Error rate over time
- Most common errors
- Active users
- API response times

### 4. Log Sampling

For high-traffic apps, implement sampling:
- Log all errors
- Sample 10% of INFO logs
- Sample 1% of DEBUG logs

---

## Support

If you have questions about logging:

1. Check `logs/` directory for log files
2. Review console logs in browser (F12)
3. Check backend API logs
4. Use command line tools to search logs

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0
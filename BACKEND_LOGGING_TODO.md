# Backend File Logging Implementation Guide

## Overview

This guide explains what needs to be implemented in your FastAPI backend to complete the centralized file-based logging system.

---

## What's Already Done

✅ **Frontend Implementation Complete**
- Logger service created (`src/services/logger.js`)
- Global error handlers added
- All components updated to use logger
- Logs are batched and sent to backend
- Configuration added to `.env`
- **Updated**: Now sends to `/api/logs/file` endpoint

---

## What Needs to Be Done (Backend)

### 1. Create File Logging Endpoint

Create a new endpoint in your FastAPI app to receive logs from the frontend and write them to files.

**File**: `routers/logs.py` (or add to existing router)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import os
import json

router = APIRouter(prefix="/api/logs", tags=["logs"])

# Ensure logs directory exists
LOGS_DIR = "logs"
os.makedirs(LOGS_DIR, exist_ok=True)

class LogEntry(BaseModel):
    timestamp: str
    level: str
    source: str
    category: str
    message: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    context: Dict[str, Any] = {}
    environment: str = "development"
    error_stack: Optional[str] = None

class LogBatch(BaseModel):
    logs: List[LogEntry]

def write_to_log_file(filename: str, log_data: dict):
    """Write log entry to file"""
    filepath = os.path.join(LOGS_DIR, filename)
    
    # Convert to JSON line format
    json_line = json.dumps(log_data, ensure_ascii=False) + "\n"
    
    # Append to file
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(json_line)

@router.post("/file")
async def receive_logs(batch: LogBatch):
    """
    Receive batched logs from frontend and store in files
    """
    try:
        saved_count = 0
        
        for log in batch.logs:
            log_dict = log.dict()
            
            # Write to individual source files
            if log_dict["source"] == "frontend":
                write_to_log_file("frontend.log", log_dict)
            elif log_dict["source"] == "backend":
                write_to_log_file("backend.log", log_dict)
            
            # Write to combined log
            write_to_log_file("combined.log", log_dict)
            
            # Write errors to error log
            if log_dict["level"] in ["ERROR", "WARN"]:
                write_to_log_file("errors.log", log_dict)
            
            saved_count += 1
        
        return {
            "status": "success",
            "message": f"{saved_count} logs saved successfully",
            "count": saved_count
        }
    except Exception as e:
        # Don't fail frontend if logging fails
        print(f"Error saving logs: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }
```

### 2. Create Logger Utility (Optional)

For logging from your FastAPI code:

**File**: `utils/logger.py`

```python
from datetime import datetime
import os
import json

class BackendLogger:
    def __init__(self):
        self.logs_dir = "logs"
        os.makedirs(self.logs_dir, exist_ok=True)
        self.environment = os.getenv("ENVIRONMENT", "development")
    
    def _log(self, level: str, category: str, message: str, 
             user_id: str = None, context: dict = None, error: Exception = None):
        """Internal logging method"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "source": "backend",
            "category": category,
            "message": message,
            "user_id": user_id,
            "email": None,
            "context": context or {},
            "environment": self.environment,
            "error_stack": str(error) if error else None
        }
        
        try:
            # Write to backend log
            self._write_to_file("backend.log", log_entry)
            
            # Write to combined log
            self._write_to_file("combined.log", log_entry)
            
            # Write errors to error log
            if level in ["ERROR", "WARN"]:
                self._write_to_file("errors.log", log_entry)
                
        except Exception as e:
            # Don't break the app if logging fails
            print(f"Error logging to file: {str(e)}")
        
        # Also log to console
        print(f"[{level}] {category}: {message}")
    
    def _write_to_file(self, filename: str, log_data: dict):
        """Write log entry to file"""
        filepath = os.path.join(self.logs_dir, filename)
        json_line = json.dumps(log_data, ensure_ascii=False) + "\n"
        
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(json_line)
    
    def debug(self, category: str, message: str, user_id: str = None, context: dict = None):
        self._log("DEBUG", category, message, user_id, context)
    
    def info(self, category: str, message: str, user_id: str = None, context: dict = None):
        self._log("INFO", category, message, user_id, context)
    
    def warn(self, category: str, message: str, user_id: str = None, context: dict = None):
        self._log("WARN", category, message, user_id, context)
    
    def error(self, category: str, message: str, user_id: str = None, 
              context: dict = None, error: Exception = None):
        self._log("ERROR", category, message, user_id, context, error)

# Create singleton instance
logger = BackendLogger()
```

### 3. Use Logger in Endpoints

Example usage in your endpoints:

```python
from utils.logger import logger

@router.post("/transactions/upload")
async def upload_transactions(
    file: UploadFile,
    wallet_id: str = Form(...),
    wallet_name: str = Form(...),
    user_id: str = Header(None, alias="X-User-ID")
):
    """Upload transactions file"""
    
    logger.info(
        "transaction",
        "Transaction upload started",
        user_id=user_id,
        context={
            "wallet_id": wallet_id,
            "wallet_name": wallet_name,
            "filename": file.filename
        }
    )
    
    try:
        # ... your upload logic ...
        
        logger.info(
            "transaction",
            "Transaction upload completed",
            user_id=user_id,
            context={
                "wallet_id": wallet_id,
                "transaction_count": len(transactions)
            }
        )
        
        return {"status": "success", "count": len(transactions)}
        
    except Exception as e:
        logger.error(
            "transaction",
            "Transaction upload failed",
            user_id=user_id,
            context={
                "wallet_id": wallet_id,
                "filename": file.filename
            },
            error=e
        )
        raise HTTPException(status_code=500, detail=str(e))
```

### 4. Add Logging Middleware (Optional)

Log all incoming requests:

```python
from fastapi import Request
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()
    user_id = request.headers.get("X-User-ID")
    
    logger.info(
        "request",
        f"{request.method} {request.url.path}",
        user_id=user_id,
        context={
            "method": request.method,
            "path": request.url.path,
            "client_ip": request.client.host
        }
    )
    
    response = await call_next(request)
    duration = time.time() - start_time
    
    log_level = "error" if response.status_code >= 400 else "info"
    log_func = logger.error if log_level == "error" else logger.info
    
    log_func(
        "response",
        f"{request.method} {request.url.path} - {response.status_code}",
        user_id=user_id,
        context={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2)
        }
    )
    
    return response
```

### 5. Register Router

Add the logging router to your main FastAPI app:

```python
# In your main.py or app.py
from routers import logs  # Import your logs router

app = FastAPI()

# ... other middleware and routers ...

app.include_router(logs.router)
```

### 6. Environment Variables

Add to your backend `.env`:

```env
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

---

## Testing the Implementation

### 1. Start Backend

```bash
uvicorn main:app --reload
```

### 2. Test Logging Endpoint

```bash
curl -X POST http://localhost:8000/api/logs/file \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "timestamp": "2025-01-15T10:30:00.000Z",
        "level": "INFO",
        "source": "frontend",
        "category": "test",
        "message": "Test log message",
        "user_id": "test_user",
        "email": "test@example.com",
        "context": {},
        "environment": "development"
      }
    ]
  }'
```

### 3. Check Log Files

```bash
# Check if logs directory was created
ls -la logs/

# View log files
cat logs/frontend.log
cat logs/combined.log
cat logs/errors.log
```

### 4. Test Frontend Integration

1. Start both frontend and backend
2. Log in to the app
3. Perform some actions (create wallet, upload transactions)
4. Check log files in `logs/` directory
5. You should see logs from both frontend and backend

---

## Log File Structure

After implementation, you'll have:

```
logs/
├── frontend.log          # All frontend logs
├── backend.log           # All backend logs  
├── combined.log          # All logs combined
└── errors.log            # Error logs only
```

### Log Format

Each line is a JSON object:

```json
{"timestamp":"2025-01-15T10:30:00.000Z","level":"INFO","source":"frontend","category":"transaction","message":"Transaction upload started","user_id":"68e619e3848c88e19bc78202","email":"user@example.com","context":{"component":"FinanceManager","wallet_id":"...","file_name":"transactions.csv"},"environment":"development"}
```

---

## Viewing Logs

### Command Line

```bash
# View recent logs
tail -n 50 logs/combined.log

# View errors only
grep "ERROR" logs/combined.log

# View logs for specific user
grep "user_id.*68e619e3848c88e19bc78202" logs/combined.log

# View logs by category
grep "category.*transaction" logs/combined.log

# Watch logs in real-time
tail -f logs/combined.log
```

### Text Editors

1. **VS Code**: Open `logs/` folder
2. **Notepad++**: Open log files with JSON syntax highlighting
3. **Sublime Text**: Open with JSON syntax highlighting

### Log Viewing Tools

1. **LogExpert** (Windows) - Free log viewer
2. **BareTail** (Windows) - Real-time log monitoring
3. **LogViewer** (Cross-platform) - JSON log viewer

---

## Verification Checklist

- [ ] POST `/api/logs/file` endpoint created
- [ ] Logs are being saved to files in `logs/` directory
- [ ] Frontend logs appearing in `logs/frontend.log`
- [ ] Backend logs appearing in `logs/backend.log`
- [ ] Combined logs appearing in `logs/combined.log`
- [ ] Error logs appearing in `logs/errors.log`
- [ ] Can view logs with text editor or command line tools
- [ ] Backend logger utility created (optional)
- [ ] Endpoints updated to use logger (optional)
- [ ] Request/response middleware added (optional)

---

## Next Steps

1. Implement the file logging endpoint (minimum requirement)
2. Test that frontend logs are being saved
3. Add backend logging utility
4. Update your endpoints to log important events
5. Add request/response middleware
6. Set up log rotation (optional)

---

## Log Rotation (Optional)

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

## Support

If you have issues:

1. Check that `logs/` directory exists and is writable
2. Verify `/api/logs/file` endpoint is accessible
3. Check backend console for errors
4. Look at browser network tab for failed requests
5. Verify log files are being created

---

**Priority**: Implement step 1 first (file logging endpoint)  
**Optional**: Steps 2-4 (backend logger utility and middleware)  
**Future**: Log viewer UI, alerts, analytics

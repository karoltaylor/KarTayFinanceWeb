# KarTay Finance Manager — Concise Docs

## Overview
- React + Vite frontend with Firebase Auth; FastAPI backend; MongoDB.
- Features: multi-wallet management, CSV/JSON transaction upload, per‑wallet pagination, summary analytics, centralized logging, and dev-only email whitelist authorization.

## Quick Start
1. Copy envs: `cp env.template .env` and fill Firebase + API URL.
2. Start backend (FastAPI) on `http://localhost:8000`.
3. Start frontend: `npm run dev` → open `http://localhost:3000`.

## Environment
- `VITE_API_BASE_URL=http://localhost:8000`
- Logging: `VITE_LOGGING_ENABLED`, `VITE_LOGGING_LEVEL`, `VITE_LOGGING_BATCH_SIZE`, `VITE_LOGGING_BATCH_INTERVAL`
- Dev authorization: `VITE_AUTHORIZATION_ENABLED=true|false`

## Authentication
- Firebase providers (Google/Facebook/GitHub).
- On login: backend user is fetched/created, then stored in context.
- Local dev uses popup; production may use redirect.

## Dev Authorization (Whitelist)
- Toggle with `VITE_AUTHORIZATION_ENABLED`.
- Add allowed emails in `src/config/authorization.js` (client-side dev gate).
- Unauthorized users see an access-denied page with sign‑out.

## Centralized Logging (File-Based)
- Frontend logger batches logs to `POST /api/logs/file`.
- Backend writes to files: `logs/frontend.log`, `backend.log`, `combined.log`, `errors.log`.
- Frontend auto-captures unhandled errors and promise rejections.
- Minimal config via env vars; fails safe if endpoint is down.

## Backend: Minimal Requirements
- Users: CRUD + lookup by Firebase UID.
- Wallets: CRUD + list by user.
- Transactions: `GET /api/transactions?wallet_id&limit&page` (returns paginated payload) and `POST /api/transactions/upload`.
- Logging: `POST /api/logs/file` that appends JSON lines to files.

## Transactions API (Shape)
Each transaction:
- `id`, `asset_name`, `asset_type`, `date` (ISO), `transaction_type` (BUY|SELL|TRANSFER), `volume`, `item_price`, `transaction_amount`, `currency`, `fee`, `created_at`.

Pagination response (latest):
- `transactions`, `count`, `total_count`, `total_pages`, `page`, `limit`, `skip`, `has_next`, `has_prev`.

Upload:
- `POST /api/transactions/upload` (FormData) includes `file`, `wallet_id`, and optionally `wallet_name` (older backend); returns any `failed_transactions`.

## Frontend Data Flow
- Per-wallet fetch: `GET /api/transactions?wallet_id=...&page&limit`.
- Pagination UI shows total count and page controls.
- After upload, the selected wallet’s transactions are re-fetched.
- Sidebar shows a wallet’s total transaction count (`total_count`), not just page size.

## Summary Page (All Wallets)
- Top stats: Total Balance, Total Deposits (BUY sum), Total Income (SELL sum).
- Two panes (stacked):
  - Balance Growth Chart (monthly, cumulative).
  - Asset Portfolio list: per-asset deposits, income, net return, return % and wallet tags.

## UI/Components Highlights
- Pagination shows current/total pages and total transactions; ellipsis rendering fixed.
- Error table shows failed uploads beneath wallet transactions.
- Wallet cards display balance and total transaction count.

## Error Handling
- API layer normalizes error responses (strings/arrays/objects) and throws readable messages.
- Global handlers capture runtime errors and unhandled rejections; logger records them.

## Troubleshooting
- Backend empty results: verify `/api/transactions` filtering and user headers.
- Seeing only 100 items: ensure backend returns `total_count/total_pages/has_next`; frontend now uses these directly.
- CORS: add FastAPI CORS middleware allowing `http://localhost:3000`.
- Authorization: toggle via env var and restart dev server.

## Useful Commands
- Frontend: `npm run dev | build | preview`
- Logs (backend host): `tail -f logs/combined.log` or search with grep.

## Next Steps
- Implement/verify `POST /api/logs/file` on backend if not done.
- Optionally add backend log middleware and rotation.
- Consider RBAC and DB-driven authorization for production.

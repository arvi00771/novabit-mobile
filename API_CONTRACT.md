# Mobile API Contract (shared reference)

**Verified against the running NovaBit preview API on August 15, 2026.**

## Base URL

- Native: set `EXPO_PUBLIC_API_URL` to the durable public HTTPS origin **including** `/api/v1`.
- Web: relative `/api/v1` is used by default.
- Do not use `localhost` in a physical device build.

Every JSON response has `success`, `data` or `error`, and `timestamp`.

## Authentication

| Request | Body | Successful `data` |
| --- | --- | --- |
| `POST /auth/register` | `{ email, password }` | `{ user_id, email, message }` (201); user must sign in afterwards |
| `POST /auth/login` | `{ email, password, totp_code? }` | Tokens (`access_token`, `refresh_token`, `expires_in`) and `user`; before a 2FA login it returns `{ require_2fa: true }` |
| `POST /auth/refresh` | `{ refresh_token }` | Rotated access and refresh token pair |
| `POST /auth/logout` | `{ refresh_token? }` | Requires bearer token |

Use `Authorization: Bearer <access_token>` for protected calls. Access tokens expire after 15 minutes; refresh tokens rotate on successful use.

## Wallets

- `GET /wallets` returns wallets with `asset`, `balance`, `locked_balance`, `available_balance` and `address`.
- `GET /transactions?limit=20&type=DEPOSIT&asset=BTC` returns history using `created_at` (not `date`).
- `GET /wallets/coins` returns policy fields including `min_withdrawal_amount`, `withdrawal_fee`, `withdrawal_requires_2fa`.
- `GET /wallets/deposit/address/:asset` returns `address`, `network`, `memo`, `asset`, `min_deposit_amount`.
- `POST /wallets/withdraw` takes `{ asset, amount, address, network, memo?, totp_code? }`.
- `GET /wallets/withdrawals?asset=BTC` uses `to_address` and `created_at`.

## Trading

- `POST /orders` takes `{ pair: 'BTCUSDT', side: 'BUY'|'SELL', type: 'LIMIT'|'MARKET', quantity, price? }`.
- `GET /market/klines/:pair?interval=1h&limit=30` was working in the audit.
- `GET /market/ticker/:pair`, `/market/orderbook/:pair`, and `/market/trades/:pair` returned server-side 500 errors in the current SQLite runtime. Frontends should show a clear unavailable state; backend repair is required before release.

See `RELEASE_READINESS_AUDIT.md` for current release blockers and test evidence.

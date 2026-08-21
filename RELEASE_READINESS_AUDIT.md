# NovaBit Mobile Release-Readiness Audit

**Audited:** August 15, 2026
**Scope:** Expo 56 / React Native iOS and Android client, current NovaBit API contract, authentication, wallet, trading, release configuration.

## Result

**Not ready for App Store or Google Play submission.** The mobile source had release-blocking mocked authentication and trading behavior, a device-invalid `localhost` API base URL, and route/response mismatches. Those client defects are fixed on this branch. Production release remains blocked by API/infrastructure, backend security and market-data failures, missing compliance UX, app signing metadata, and device-build validation.

## Client fixes in this branch

- Replaced mock registration, sign-in, 2FA, biometric sign-in and trade submission with the current `/api/v1` API contract.
- Added securely persisted access and refresh tokens, one-at-a-time refresh-token rotation after a 401, local token cleanup on failed refresh, and best-effort server logout.
- Biometric quick unlock now gates a stored session behind OS authentication; it no longer creates a mock session. Enrollment/hardware checks are required before enabling it.
- Removed the hard-coded `http://localhost:3000` device endpoint. Native builds now require `EXPO_PUBLIC_API_URL`; `.env.example` documents the expected public HTTPS URL ending in `/api/v1`. Web keeps a relative `/api/v1` default.
- Corrected wallet endpoints from `/v1/...` to the API client’s `/api/v1` base, corrected history fields (`created_at`, `to_address`), and made the withdrawal 2FA UI conditional on the server-provided coin policy.
- Connected BTC/USDT order submission and market calls to the backend. Market panels now degrade independently rather than failing the entire screen when one feed is unavailable.

## API contract smoke test

Executed against the currently reachable preview API on **August 15, 2026**:

| Flow | Result |
| --- | --- |
| `POST /auth/register` | Passed (201) |
| `POST /auth/login` | Passed; access + refresh token returned |
| `GET /wallets` with bearer token | Passed; seeded wallets returned |
| `POST /auth/refresh` | Passed; rotation returned new token pair |
| `GET /market/pairs` | Passed |
| `GET /market/klines/BTCUSDT` | Passed |
| `GET /market/ticker/BTCUSDT` | Failed (500) |
| `GET /market/orderbook/BTCUSDT` | Failed (500) |
| `GET /market/trades/BTCUSDT` | Failed (500) |

The currently reachable preview API is useful for verification only; do **not** bake it into a store release. A durable public API hostname must be supplied through `EXPO_PUBLIC_API_URL` at build time.

## Release blockers and required owners

### Backend / security

1. **Trading market data is broken in the active SQLite runtime.** Ticker uses PostgreSQL interval syntax (`NOW() - INTERVAL '24 hours'`); recent trades query a missing `quote_quantity` column; order book also returns 500. Repair the SQLite compatibility/schema mismatch and add route-level regression tests before mobile trading is enabled.
2. **Withdrawal 2FA is not verified server-side.** The current wallet service records whether a TOTP was supplied but does not validate the supplied TOTP. Never treat a mobile form field as security enforcement; backend must verify TOTP and enforce withdrawal controls/whitelists.
3. **The backend uses an in-memory SQLite database.** Accounts, refresh tokens, wallet state, transactions and KYC metadata are lost on restart. Use a durable production database and managed migrations before onboarding real users.
4. **A stable native API origin is not yet provisioned.** `novabit.exchange` currently serves the web app rather than a native API response at the expected API path. Provision a durable HTTPS API host/proxy, then set `EXPO_PUBLIC_API_URL=<origin>/api/v1` in EAS/build secrets.

### Product / compliance

5. **There is no mobile KYC submission/status screen**, although KYC is required for the regulated product. Add a secure document-capture/upload and status flow only after backend KYC review, limits, audit logging and persistent document storage are production-ready.
6. **Deposit addresses are deterministic application-generated strings in the current backend.** Do not represent them as on-chain custody until wallet/custody integration, monitoring and reconciliation are in place.

### iOS / Android operations

7. `app.json` still lacks final, owner-controlled `ios.bundleIdentifier` and `android.package`, production version/build numbers, final app name/icon/privacy metadata, and the native Face ID usage configuration required for a production iOS biometric flow. Set only identifiers the organization owns.
8. Apple Developer and Google Play Console accounts, signing credentials, EAS build configuration, privacy disclosures/data-safety forms, support/privacy URLs, age/content rating, export-compliance responses, and store listing assets still need owner/operations completion.
9. Test on physical iOS and Android devices (including biometric enrollment/no-enrollment, offline mode, token expiry, 2FA, keyboard/safe-area behavior, deposit/withdrawal guards and accessibility) and run signed release builds before submission.

## Validation limitation

The local Expo dependency installation could not complete because the available `/home` filesystem is 2 GB and reached `ENOSPC`; this audit did not claim a native build or simulator pass. Static review and live API contract smoke tests were completed. Run `npm ci`, TypeScript checks, Expo diagnostics and signed iOS/Android builds in a release CI runner with adequate disk before approval.

## Repository delivery note

At audit start, `arvi00771/novabit-mobile` had an empty `main` branch with no commits, while the shared mobile source was an uncommitted baseline. This branch preserves that baseline plus the fixes, but a normal review PR requires the team to establish the initial repository history/base branch first.

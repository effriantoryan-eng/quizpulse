# QuizPulse — Claude Code Context

## What this project is

QuizPulse is a low-stakes classroom quiz app for secondary school teachers and students (Years 7–12).
Teachers create short multiple-choice check-in quizzes and send them to students via a shareable link.
Students answer on mobile. No grades or scores are shown — participation only.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (SPA, React Router v6) |
| Hosting | Azure Static Web Apps (free tier, GitHub CI/CD) |
| Backend | Azure Functions — Node.js v4 runtime, HTTP-triggered, serverless |
| Database | Azure Cosmos DB (NoSQL, serverless mode) |
| Auth | Azure Static Web Apps Easy Auth — Entra ID (Simple mode) |
| Secret management | Azure Key Vault — Cosmos DB key stored as secret, referenced via managed identity |
| Logging | Azure Application Insights — structured request logging (active) |
| Notifications | Azure Notification Hubs (post-MVP, not yet implemented) |

## Local paths

- Project root: `C:\Users\Ryan\quizpulse\`
- Frontend source: `src/`
- Azure Functions: `api/`
- Built output: `dist/`

## Live URLs

- Production site: `https://mango-meadow-0a5aa7410.7.azurestaticapps.net`
- Function App (direct): `https://quizpulse-api-b5bvbvgzdph6dyas.australiaeast-01.azurewebsites.net/api`
- GitHub repo: `https://github.com/effriantoryan-eng/quizpulse`

## Running locally

Three terminals required:

```powershell
# Terminal 1 — React dev server
cd C:\Users\Ryan\quizpulse
npm run dev        # → localhost:5173

# Terminal 2 — Azure Functions
cd C:\Users\Ryan\quizpulse\api
func start         # → localhost:7071

# Terminal 3 — Azurite storage emulator
azurite --silent
```

Deploy frontend: push to `develop` → PR → merge to `master` → GitHub Actions auto-deploys (~1 min)
Deploy API: `cd api` then `func azure functionapp publish quizpulse-api` (must be done separately)

**Important:** Do not use `&&` in PowerShell — run commands on separate lines.

All development work goes on the `develop` branch. Merge to `master` via PR to trigger SWA deployment.

## File structure

```
src/
  pages/
    teacher/
      CreateQuestion.jsx   — save questions to Cosmos DB (working)
      QuestionBank.jsx     — load/filter/edit/delete questions (working)
      BuildQuiz.jsx        — assemble quiz from real DB questions (working)
      SendQuiz.jsx         — POST quiz to DB, generate shareable student link (working)
      Analytics.jsx        — per-question response breakdown, real data (working)
    student/
      TakeQuiz.jsx         — load real quiz by ID, answer questions, submit responses (working)
      Completion.jsx       — done screen, shows real quiz name + question count (working)
  components/
    DemoNav.jsx            — persistent nav bar; fetches most recent quizId dynamically from API
    AuthContext.jsx        — fetches /.auth/me, provides { user, teacherId, loading } via context
    ProtectedRoute.jsx     — redirects unauthenticated users to Entra ID login on production;
                             passes through on localhost for local dev
  api.js                   — centralised API base URL; localhost:7071/api locally,
                             direct Function App URL in production (see API routing note below)
  session.js               — sessionStorage studentId for anonymous student responses
  App.jsx                  — main router, all routes, DemoNav + AuthContext rendered globally
api/
  questions.js             — GET/POST /api/questions + PUT/DELETE /api/questions/:id
  quizzes.js               — GET/POST /api/quizzes, GET /api/quizzes/:id
  responses.js             — GET/POST /api/responses
  classes.js               — GET /api/classes (static class list)
  rateLimit.js             — in-memory sliding window rate limiter (per IP, per Function instance)
  logger.js                — structured request logger → Application Insights
  host.json
  local.settings.json      — local Cosmos DB keys (gitignored, never commit)
staticwebapp.config.json   — SPA fallback + auth config + security headers (CSP, HSTS, etc.)
```

## Application routes

| Route | Component | Auth required |
|---|---|---|
| `/` | CreateQuestion | Yes (teacher) |
| `/teacher/create` | CreateQuestion | Yes (teacher) |
| `/teacher/bank` | QuestionBank | Yes (teacher) |
| `/teacher/build` | BuildQuiz | Yes (teacher) |
| `/teacher/send` | SendQuiz | Yes (teacher) |
| `/teacher/analytics/:quizId` | Analytics | Yes (teacher) |
| `/student/quiz/:id` | TakeQuiz | No (public) |
| `/student/done` | Completion | No (public) |

`/teacher/*` routes are protected at the SWA edge via `allowedRoles: [authenticated]` in
`staticwebapp.config.json`. Unauthenticated requests are redirected to `/.auth/login/aad`.
Student routes remain fully open — no login required to take a quiz.

## Authentication

- Provider: Azure Static Web Apps Easy Auth with Entra ID (Simple mode)
- Login endpoint: `/.auth/login/aad`
- User info endpoint: `/.auth/me` — returns `clientPrincipal` with stable `userId`
- `AuthContext.jsx` fetches `/.auth/me` on mount and provides `{ user, teacherId, loading }`
- `teacherId` = stable Entra ID `userId` on production; falls back to a `localStorage` UUID on localhost
- `ProtectedRoute.jsx` redirects to `/.auth/login/aad` when `user` is null (production only)
- Student identity: anonymous `sessionStorage` UUID via `session.js` — no login required

## API routing — IMPORTANT

**In production, `src/api.js` calls the Function App URL directly:**

```js
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:7071/api'
  : 'https://quizpulse-api-b5bvbvgzdph6dyas.australiaeast-01.azurewebsites.net/api'
```

**Why:** Azure SWA free tier does not reliably proxy POST/PUT/DELETE requests via the `rewrite` rule
in `staticwebapp.config.json`. The `/api/*` rewrite works for GET but returns 405 for mutating
methods. The fix was to call the Function App directly and add the Function App origin to the CSP
`connect-src` directive. The SWA rewrite rule for `/api/*` remains in the config but is no longer
used by the frontend.

**Do not revert this to `/api` for production** — it will break all write operations.

## Cosmos DB schema

Database: `quizpulse`

**questions container**
```json
{
  "id": "uuid",
  "teacherId": "Entra ID userId (stable)",
  "text": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "topic": "Science",
  "createdAt": "ISO 8601"
}
```

**quizzes container**
```json
{
  "id": "uuid",
  "teacherId": "Entra ID userId (stable)",
  "name": "Week 4 — Photosynthesis check-in",
  "questionIds": ["uuid1", "uuid2"],
  "classIds": ["class-id"],
  "classSize": 28,
  "status": "draft | sent | scheduled",
  "sentAt": "ISO 8601",
  "createdAt": "ISO 8601"
}
```

**responses container**
```json
{
  "id": "uuid",
  "quizId": "uuid",
  "studentId": "sessionStorage anonymous UUID",
  "answers": [{ "questionId": "uuid", "selectedIndex": 2 }],
  "completedAt": "ISO 8601"
}
```

## API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /questions | Teacher | Save a new question |
| GET | /questions?teacherId= | Teacher | Get all questions scoped to teacherId |
| PUT | /questions/:id | Teacher | Update a question (ownership checked) |
| DELETE | /questions/:id?teacherId= | Teacher | Delete a question (ownership checked) |
| POST | /quizzes | Teacher | Save a new quiz, returns quiz `id` |
| GET | /quizzes?teacherId= | Teacher | Get all quizzes for teacher |
| GET | /quizzes/:id | Public | Get a specific quiz by ID (student access) |
| POST | /responses | Public | Submit student answers |
| GET | /responses?quizId= | Teacher | Get all responses for a quiz |
| GET | /classes | Public | Get static class list |

### Request security (applied to all POST/PUT handlers)

1. Rate limit — in-memory sliding window per IP (via `rateLimit.js`)
2. Content-Length check — reject over 64KB (returns 413)
3. Body type check — must be JSON object
4. Field validation — type, length, and enum checks with descriptive 400 errors
5. Ownership check on PUT/DELETE — teacherId in request must match stored document

All 500 errors return `{ error: "An unexpected error occurred" }` to the client.

### Azure Functions v4 logging

Use `context.error()`, `context.warn()`, `context.log()` — NOT `context.log.error/warn/info`.
The `context.log.*` sub-methods do not exist in the v4 Node.js worker and will throw, causing
all requests that hit the catch block to return 500 instead of the intended error response.

## Azure Function App environment variables

Set in Azure portal → quizpulse-api → Configuration:

```
COSMOS_ENDPOINT=https://quizpulse-db.documents.azure.com:443/
COSMOS_KEY=@Microsoft.KeyVault(VaultName=quizpulse-kv;SecretName=COSMOS-KEY)
COSMOS_DATABASE=quizpulse
COSMOS_CONTAINER_QUESTIONS=questions
COSMOS_CONTAINER_QUIZZES=quizzes
COSMOS_CONTAINER_RESPONSES=responses
AzureWebJobsStorage=(connection string from quizpulsestorage)
APPLICATIONINSIGHTS_CONNECTION_STRING=(set — now active)
```

`COSMOS_KEY` is a Key Vault reference — the Function App managed identity has Key Vault Secrets User
role on `quizpulse-kv`. The raw key is never stored in Function App configuration.

## Azure resources (resource group: quizpulse-rg)

| Resource | Name | Region | Notes |
|---|---|---|---|
| Static Web App | quizpulse | Central US | Hosts React frontend |
| Function App | quizpulse-api | Australia East | Node 22 LTS, Consumption Windows |
| Cosmos DB | quizpulse-db | West US 2 | NoSQL serverless |
| Key Vault | quizpulse-kv | — | Stores COSMOS-KEY secret |
| Storage Account | quizpulsestorage | Australia East | Functions host storage |
| App Insights | quizpulse-api | Australia East | Active — connection string set |

## Feature status

| Feature | Status | Notes |
|---|---|---|
| Create Question | ✅ Working | Validated, scoped by teacherId |
| Question Bank | ✅ Working | Backend-filtered by authenticated teacherId |
| Edit/delete questions | ✅ Working | PUT/DELETE /api/questions/:id; inline edit UI in QuestionBank |
| Build Quiz | ✅ Working | Loads real questions from API, reorder + remove |
| Send Quiz | ✅ Working | POSTs quiz to Cosmos DB, returns shareable student link |
| Take Quiz | ✅ Working | Fetches quiz first, uses quiz.teacherId for questions fetch |
| Completion screen | ✅ Working | Reads real quiz name and question count from router state |
| Analytics | ✅ Working | Fetches quiz first, uses quiz.teacherId, filters to quiz.questionIds |
| classSize on quiz | ✅ Working | Stored at send time; Analytics shows "X / Y responded" |
| Class management | ✅ Working | GET /api/classes endpoint live; SendQuiz fetches dynamically |
| Teacher auth (Entra ID) | ✅ Working | Protects /teacher/* routes, stable userId |
| DemoNav | ✅ Working | Fetches most recent quizId dynamically |
| App Insights logging | ✅ Working | APPLICATIONINSIGHTS_CONNECTION_STRING set in Function App config |
| Student auth | ❌ Post-MVP | Anonymous sessionStorage UUID only |
| Push notifications | ❌ Post-MVP | Azure Notification Hubs — not started |
| Schedule quiz | ❌ Post-MVP | UI placeholder exists, backend not implemented |
| Quiz link expiry | ❌ Post-MVP | No closedAt field or expiry logic yet |
| Admin & rostering | ❌ Post-MVP | — |
| LMS integration | ❌ Post-MVP | — |

## Known issues

### 1. SWA free tier does not proxy POST/PUT/DELETE
The `/api/*` rewrite rule in `staticwebapp.config.json` returns 405 for mutating HTTP methods.
Frontend now calls the Function App URL directly (see API routing section). The SWA rewrite
remains in config for reference but is bypassed.
Long-term fix: upgrade SWA to Standard tier and use the linked backend feature instead.

### 2. Rate limiter is per-instance, not global
`rateLimit.js` uses an in-memory Map. State is not shared across Function App scale-out replicas.
Fine for MVP; upgrade to Azure API Management for production scale.

### 3. Cosmos DB IP restriction skipped
The Consumption plan does not support static outbound IPs (VNet integration requires Flex or Premium).
Deferred until a plan upgrade is justified.

### 4. Function App must be deployed separately
The GitHub Actions workflow (`azure-static-web-apps-mango-meadow-0a5aa7410.yml`) only deploys the
React frontend. Any changes to `api/` must be deployed manually:
```powershell
cd api
func azure functionapp publish quizpulse-api
```

## What was fixed in the last session (session log)

This section documents bugs found, attempts made, and solutions reached — for next session context.

### Bug 1: TakeQuiz — students could not take any quiz
**Root cause:** `TakeQuiz.jsx` called `GET /api/questions` without a `teacherId` param. The backend
requires it and returns 400. `ordered.length === 0` triggered "This quiz has no questions" error.
**Fix:** Fetch `GET /api/quizzes/:id` first (sequential, not parallel), then use `quiz.teacherId`
to call `GET /api/questions?teacherId=quiz.teacherId`.

### Bug 2: Analytics — question breakdown always empty
**Root cause:** Same missing `teacherId` bug. Also, questions were not filtered to `quiz.questionIds`
so the "Questions in quiz" count was wrong.
**Fix:** Fetch quiz first, use `quiz.teacherId` for questions call, filter to `quiz.questionIds`.

### Bug 3: Completion screen — hardcoded data
**Root cause:** `Completion.jsx` hardcoded quiz name ("Week 4 — Photosynthesis") and question count.
`TakeQuiz` navigated to `/student/done` with no router state.
**Fix:** Pass `{ quizName: quiz.name, questionCount: questions.length }` via router state from
TakeQuiz. Completion reads from `useLocation().state` with graceful fallback.

### Bug 4: All POST/PUT/DELETE returning 500
**Root cause:** `context.log.error()` does not exist in Azure Functions v4 Node.js worker. When any
request hit the catch block (e.g. a Cosmos DB error), calling `context.log.error` itself threw
`TypeError: context.log.error is not a function`, masking the original error and returning 500.
**Fix:** Replaced all `context.log.error` → `context.error`, `context.log.warn` → `context.warn`,
`context.log.info` → `context.log` across `questions.js`, `quizzes.js`, `responses.js`, `logger.js`.

### Bug 5: SWA proxy returning 405 for POST requests
**Root cause:** Azure SWA free tier does not reliably proxy POST/PUT/DELETE via the `rewrite` rule
to an external URL. GET requests worked; mutating requests returned 405 with no response body.
**Attempts:**
- Checked `staticwebapp.config.json` — rewrite rule was correct, no method restrictions
- Checked GitHub Actions workflow — `api_location: ""` so SWA wasn't trying to deploy functions
- Tested Function App directly via browser console — blocked by CSP `connect-src 'self'`
- Confirmed the rewrite rule was identical on master
**Fix:** Changed `src/api.js` to call the Function App URL directly in production instead of
relying on the SWA proxy. Updated CSP `connect-src` to include the Function App origin.

### New features added
- `PUT /api/questions/:id` and `DELETE /api/questions/:id` with ownership checks
- Inline edit form and delete button in QuestionBank
- `GET /api/classes` Function endpoint — removed hardcoded class array from SendQuiz
- `classSize` field on quiz documents; Analytics shows "X / Y responded"
- App Insights `APPLICATIONINSIGHTS_CONNECTION_STRING` set and active

## Post-MVP features (planned for future sessions)

- Quiz link expiry (`closedAt` field + "quiz is closed" screen)
- Student accounts with Microsoft school login
- Quiz scheduling (send later — UI placeholder exists, backend not implemented)
- School admin controls and bulk roster import
- CSV export from Analytics
- Native push notifications via Azure Notification Hubs (iOS + Android)
- LMS integration (Canvas, Schoolbox)
- Shared question bank across a school

## Coding conventions

- React functional components only, hooks for state
- Async/await for all API calls, always wrap in try/catch
- API calls use `API_BASE` imported from `src/api.js`
- In production `API_BASE` is the direct Function App URL — do not change to `/api`
- `teacherId` from `AuthContext` (Entra ID userId on production, localStorage UUID on localhost)
- `studentId` from `session.js` (sessionStorage UUID, anonymous)
- No TypeScript — plain JavaScript throughout
- CSS is inline styles — no CSS modules or styled-components
- Azure Functions v4: use `context.error()` / `context.warn()` / `context.log()` — not `context.log.*`

## Build & deployment

```powershell
# Frontend — commit and push to develop, then PR to master
git add .
git commit -m "message"
git push
# → merge PR to master → GitHub Actions deploys frontend automatically

# API — must be deployed manually every time api/ files change
cd api
func azure functionapp publish quizpulse-api
```

## Azure portal quick links

- Cosmos DB Data Explorer: portal.azure.com → quizpulse-rg → quizpulse-db → Data Explorer
- Function App config: portal.azure.com → quizpulse-rg → quizpulse-api → Configuration
- Function App logs: portal.azure.com → quizpulse-rg → quizpulse-api → Functions → [function] → Monitor
- App Insights logs: portal.azure.com → quizpulse-rg → quizpulse-api (App Insights) → Logs
- Static Web App: portal.azure.com → quizpulse-rg → quizpulse → Deployments
- Key Vault: portal.azure.com → quizpulse-rg → quizpulse-kv → Secrets

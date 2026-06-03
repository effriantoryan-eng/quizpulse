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
| Backend | Azure Functions — Node.js, HTTP-triggered, serverless |
| Database | Azure Cosmos DB (NoSQL, serverless mode) |
| Auth | Azure Static Web Apps Easy Auth — Entra ID (Simple mode) |
| Secret management | Azure Key Vault — Cosmos DB key stored as secret, referenced via managed identity |
| Logging | Azure Application Insights — structured request logging (wired, needs connection string set) |
| Notifications | Azure Notification Hubs (post-MVP, not yet implemented) |

## Local paths

- Project root: `C:\Users\Ryan\quizpulse\`
- Frontend source: `src/`
- Azure Functions: `api/`
- Built output: `dist/`

## Live URLs

- Production site: `https://mango-meadow-0a5aa7410.7.azurestaticapps.net`
- API (via SWA proxy): `/api/*` → `https://quizpulse-api-b5bvbvgzdph6dyas.australiaeast-01.azurewebsites.net/api`
- GitHub repo: `https://github.com/effriantoryan-eng/quizpulse`

## Running locally

Three terminals required:

```bash
# Terminal 1 — React dev server
cd C:\Users\Ryan\quizpulse && npm run dev        # → localhost:5173

# Terminal 2 — Azure Functions
cd C:\Users\Ryan\quizpulse\api && func start     # → localhost:7071

# Terminal 3 — Azurite storage emulator
azurite --silent
```

Deploy to production: `git add . && git commit -m "message" && git push`

All development work goes on the `develop` branch. Merge to `master` via PR to trigger deployment.

## File structure

```
src/
  pages/
    teacher/
      CreateQuestion.jsx   — save questions to Cosmos DB (working)
      QuestionBank.jsx     — load/filter questions from Cosmos DB (working)
      BuildQuiz.jsx        — assemble quiz from real DB questions (working)
      SendQuiz.jsx         — POST quiz to DB, generate shareable student link (working)
      Analytics.jsx        — per-question response breakdown, real data (working)
    student/
      TakeQuiz.jsx         — load real quiz by ID, answer questions, submit responses (working)
      Completion.jsx       — done screen, no score shown (working)
  components/
    DemoNav.jsx            — persistent nav bar; fetches most recent quizId dynamically from API
    AuthContext.jsx        — fetches /.auth/me, provides { user, teacherId, loading } via context
    ProtectedRoute.jsx     — redirects unauthenticated users to Entra ID login on production;
                             passes through on localhost for local dev
  api.js                   — centralised API base URL; returns localhost:7071/api locally,
                             /api in production (proxied through SWA)
  session.js               — sessionStorage studentId for anonymous student responses
  App.jsx                  — main router, all routes, DemoNav + AuthContext rendered globally
api/
  questions.js             — GET/POST /api/questions
  quizzes.js               — GET/POST /api/quizzes, GET /api/quizzes/:id
  responses.js             — GET/POST /api/responses
  rateLimit.js             — in-memory sliding window rate limiter (per IP, per Function instance)
  logger.js                — structured request logger → Application Insights via context.log
  host.json
  local.settings.json      — local Cosmos DB keys (gitignored, never commit)
staticwebapp.config.json   — SPA fallback + /api/* proxy to Function App + auth config +
                             security headers (CSP, HSTS, X-Frame-Options, etc.)
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

## API routing

All frontend API calls use the relative `/api` path from `src/api.js`:

```js
// src/api.js
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:7071/api'
  : '/api';

export default API_BASE;
```

On production, `/api/*` is rewritten by `staticwebapp.config.json` to the Azure Function App URL.
The backend hostname never appears in the compiled JS bundle.

**Do not hardcode the Function App URL directly in any component.** Always import from `src/api.js`.

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

All functions in `api/`. Accessed via `/api` proxy in production.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /questions | Teacher | Save a new question |
| GET | /questions | Teacher | Get all questions scoped to teacherId |
| POST | /quizzes | Teacher | Save a new quiz, returns quiz `id` |
| GET | /quizzes | Teacher | Get all quizzes for teacher |
| GET | /quizzes/:id | Public | Get a specific quiz by ID (student access) |
| POST | /responses | Public | Submit student answers |
| GET | /responses?quizId=x | Teacher | Get all responses for a quiz |

### Request security (applied to all POST handlers)

1. Rate limit check — in-memory sliding window per IP (via `rateLimit.js`)
   - POST /questions: 30 req/min
   - POST /quizzes: 10 req/min
   - POST /responses: 5 req/min
2. Content-Length check — reject over 64KB (returns 413)
3. Body type check — must be JSON object, not array or primitive
4. Field validation — type, length, and enum checks with descriptive 400 errors

All 500 errors return `{ error: "An unexpected error occurred" }` to the client.
Internal `err.message` is written to `context.log.error` → Application Insights.

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
APPLICATIONINSIGHTS_CONNECTION_STRING=(set this to activate logging)
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
| App Insights | quizpulse-api | Australia East | Monitoring — needs connection string |

## Feature status

| Feature | Status | Notes |
|---|---|---|
| Create Question | ✅ Working | Validated, scoped by teacherId |
| Question Bank | ✅ Working | Backend-filtered by authenticated teacherId |
| Build Quiz | ✅ Working | Loads real questions from API, reorder + remove |
| Send Quiz | ✅ Working | POSTs quiz to Cosmos DB, returns shareable student link |
| Take Quiz | ✅ Working | Fetches quiz first, uses quiz.teacherId for questions fetch |
| Completion screen | ✅ Working | Reads real quiz name and question count from router state |
| Analytics | ✅ Working | Fetches quiz first, uses quiz.teacherId, filters to quiz.questionIds |
| Teacher auth (Entra ID) | ✅ Working | Protects /teacher/* routes, stable userId |
| DemoNav | ✅ Working | Fetches most recent quizId dynamically |
| App Insights logging | ⚠️ Partial | Code wired — set APPLICATIONINSIGHTS_CONNECTION_STRING to activate |
| Class management | ✅ Working | GET /api/classes endpoint live; SendQuiz fetches dynamically |
| Student auth | ❌ Post-MVP | Anonymous sessionStorage UUID only |
| Push notifications | ❌ Post-MVP | Azure Notification Hubs — not started |
| Schedule quiz | ❌ Post-MVP | UI placeholder exists, backend not implemented |
| Quiz link expiry | ❌ Post-MVP | No closedAt field or expiry logic yet |
| Edit/delete questions | ✅ Working | PUT/DELETE /api/questions/:id implemented; edit/delete UI in QuestionBank |
| Admin & rostering | ❌ Post-MVP | — |
| LMS integration | ❌ Post-MVP | — |

## Known issues

### 1. App Insights logging inactive
`APPLICATIONINSIGHTS_CONNECTION_STRING` is not yet set in the Function App config. All structured
logging calls exist in `logger.js` but telemetry is not flowing. Set this in the Azure portal
(Function App → Configuration) to activate.

### 2. Rate limiter is per-instance, not global
`rateLimit.js` uses an in-memory Map. State is not shared across Function App scale-out replicas.
Fine for MVP; upgrade to Azure API Management for production scale.

### 4. Cosmos DB IP restriction skipped
The Consumption plan does not support static outbound IPs (VNet integration requires Flex or Premium).
Deferred until a plan upgrade is justified.

## Next priorities

1. Activate App Insights: set `APPLICATIONINSIGHTS_CONNECTION_STRING` in Azure portal → quizpulse-api → Configuration (config-only, no code change)

## Post-MVP features

- Native push notifications via Azure Notification Hubs (iOS + Android)
- Student accounts with Microsoft school login
- Quiz link expiry (`closedAt` field + "quiz is closed" screen)
- Quiz scheduling (send later)
- School admin controls and bulk roster import
- LMS integration (Canvas, Schoolbox)
- Shared question bank across school
- CSV export from Analytics

## Coding conventions

- React functional components only, hooks for state
- Async/await for all API calls, always wrap in try/catch
- API calls use `API_BASE` imported from `src/api.js` — never hardcode the Function App URL
- `teacherId` from `AuthContext` (Entra ID userId on production, localStorage UUID on localhost)
- `studentId` from `session.js` (sessionStorage UUID, anonymous)
- No TypeScript — plain JavaScript throughout
- CSS is inline styles — no CSS modules or styled-components

## Build & deployment

```bash
npm run build           # builds to dist/
git push                # triggers GitHub Actions → Azure Static Web Apps deploy (~1 min)
```

CI/CD: `develop` branch for all work → PR → merge to `master` → auto-deploy.
Function App is deployed separately (not part of SWA CI/CD pipeline).

## Azure portal quick links

- Cosmos DB Data Explorer: portal.azure.com → quizpulse-rg → quizpulse-db → Data Explorer
- Function App config: portal.azure.com → quizpulse-rg → quizpulse-api → Configuration
- Function App logs: portal.azure.com → quizpulse-rg → quizpulse-api → Functions
- Static Web App: portal.azure.com → quizpulse-rg → quizpulse → Deployments
- Key Vault: portal.azure.com → quizpulse-rg → quizpulse-kv → Secrets

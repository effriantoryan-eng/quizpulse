# QuizPulse — Claude Code Context

## What this project is

QuizPulse is a low-stakes classroom quiz app for secondary school teachers (Years 7–12).
This is a **teacher-only demo**: teachers create questions, build quizzes, send them to a preset class,
and view analytics. Student responses are simulated automatically on send — no real student flow exists.
Student view, push notifications, and other upcoming features are shown as static mockups in the Preview gallery.

The demo is **fully public** — no login required. Any visitor gets a stable `localStorage` UUID as their
`teacherId`. Their data persists across page refreshes in the same browser but is isolated from all other visitors.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (SPA, React Router v6) |
| Hosting | Azure Static Web Apps (free tier, GitHub CI/CD) |
| Backend | Azure Functions — Node.js v4 runtime, HTTP-triggered, serverless |
| Database | Azure Cosmos DB (NoSQL, serverless mode) |
| Auth | None — removed. `teacherId` is a `localStorage` UUID per browser |
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
    Home.jsx             — landing page with demo flow overview and CTA buttons
    DemoGallery.jsx      — static mockup gallery (student view, push notifications, etc.)
    Login.jsx            — DEAD CODE — leftover MSAL login page, not routed, delete in next cleanup
    teacher/
      CreateQuestion.jsx — save questions to Cosmos DB (working)
      QuestionBank.jsx   — load/filter/edit/delete questions (working)
      BuildQuiz.jsx      — assemble quiz from real DB questions (working)
      SendQuiz.jsx       — POST quiz to DB, trigger simulate, show analytics link (working)
      Analytics.jsx      — per-question response breakdown, real data (working)
      QuizHistory.jsx    — list all sent quizzes, click through to analytics (working)
  components/
    DemoNav.jsx          — persistent nav bar; Home, teacher flow, My Quizzes, Preview
  contexts/
    AuthContext.jsx      — provides { teacherId } via localStorage UUID; no auth fetch
  session.js             — localStorage UUID helper (getSessionId); studentId export is dead code
  api.js                 — centralised API base URL; localhost:7071/api locally,
                           direct Function App URL in production (see API routing note below)
  App.jsx                — main router, all routes rendered directly (no ProtectedRoute)
api/
  questions.js           — GET/POST /api/questions + PUT/DELETE /api/questions/:id
  quizzes.js             — GET/POST /api/quizzes, GET /api/quizzes/:id
  responses.js           — GET/POST /api/responses
  simulate.js            — POST /api/simulate — server-side bulk response generation
  classes.js             — GET /api/classes — UNUSED by frontend (SendQuiz uses hardcoded PRESET_CLASSES)
  rateLimit.js           — in-memory sliding window rate limiter (per IP, per Function instance)
  logger.js              — structured request logger → Application Insights
  host.json
  local.settings.json    — local Cosmos DB keys (gitignored, never commit)
staticwebapp.config.json — SPA fallback + security headers (no auth rules — routes are fully public)
```

## Demo flow

1. `/` — Home page: intro, "Start demo" → Create Question, "Preview mockups" → DemoGallery
2. `/teacher/create` — Create questions (real Cosmos DB writes)
3. `/teacher/bank` — Browse, edit, delete questions
4. `/teacher/build` — Select questions, name the quiz, proceed to Send
5. `/teacher/send` — Pick preset class(es), click Send → quiz saved → simulate called → redirect to Analytics
6. `/teacher/analytics/:quizId` — Real response breakdown from simulated data
7. `/teacher/quizzes` — Quiz history — all sent quizzes, click any to view analytics
8. `/demo` — Static mockup gallery (student view, push notifications, scheduling, etc.)

## Identity — how teacherId works

There is no login. On first visit, `session.js` generates a `crypto.randomUUID()` and stores it in
`localStorage` under the key `quizpulse_teacher_id`. This UUID is the `teacherId` for all API calls.

| Scenario | Result |
|---|---|
| Same browser, return visit | Same UUID — questions and quizzes persist |
| Different browser or device | New UUID — fresh isolated data |
| Clear localStorage | New UUID — previous data orphaned in Cosmos DB |
| Two people on different browsers | Completely isolated — no shared state |

All API endpoints accept any `teacherId` string — there is no server-side auth enforcement.
Data isolation is purely by UUID scoping in Cosmos DB queries.

## Preset classes (hardcoded in frontend SendQuiz.jsx — api/classes.js is unused)

| ID | Name | Students | Topic |
|---|---|---|---|
| yr9-sci | Year 9 Science | 28 | Science |
| yr10-mth | Year 10 Maths | 25 | Mathematics |
| yr7-eng | Year 7 English | 22 | English |

Max combined: 75 students (~1,125 RUs per send — well within Cosmos DB serverless free tier).

## Application routes

| Route | Component | Auth required |
|---|---|---|
| `/` | Home | No |
| `/demo` | DemoGallery | No |
| `/teacher/create` | CreateQuestion | No |
| `/teacher/bank` | QuestionBank | No |
| `/teacher/build` | BuildQuiz | No |
| `/teacher/send` | SendQuiz | No |
| `/teacher/quizzes` | QuizHistory | No |
| `/teacher/analytics/:quizId` | Analytics | No |

All routes are fully public. SWA edge auth rules have been removed from `staticwebapp.config.json`.

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

## Simulate endpoint — POST /api/simulate

Accepts `{ quizId, questions, classSize }` and generates `classSize` response documents server-side
in a single HTTP call. Bypasses the per-IP rate limit on `/api/responses`.

```json
// Request
{
  "quizId": "uuid",
  "questions": [{ "id": "uuid", "optionCount": 4 }],
  "classSize": 28
}
// Response 201
{ "generated": 28 }
```

- Responses are written in parallel via `Promise.all`
- Each response has `simulated: true` on the document
- Rate limit: 10 calls/minute per IP (dedicated key `simulate:<ip>`)
- classSize is validated: integer 1–100

**Why a dedicated endpoint instead of N client-side POSTs:** The `/responses` endpoint has a
5 req/min per-IP rate limit. A class of 28 would be throttled immediately. The simulate endpoint
handles all writes server-side in one call.

## Cosmos DB schema

Database: `quizpulse`

**questions container**
```json
{
  "id": "uuid",
  "teacherId": "localStorage UUID",
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
  "teacherId": "localStorage UUID",
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
  "studentId": "random UUID (generated server-side by simulate)",
  "answers": [{ "questionId": "uuid", "selectedIndex": 2 }],
  "completedAt": "ISO 8601",
  "simulated": true
}
```

**Note:** Orphaned data accumulates when visitors clear localStorage (their UUID changes but old
documents remain). For a demo this is acceptable. Add a periodic cleanup or TTL policy if needed.

## API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /questions | None | Save a new question |
| GET | /questions?teacherId= | None | Get all questions scoped to teacherId |
| PUT | /questions/:id | None | Update a question (ownership checked by teacherId) |
| DELETE | /questions/:id?teacherId= | None | Delete a question (ownership checked by teacherId) |
| POST | /quizzes | None | Save a new quiz, returns quiz `id` |
| GET | /quizzes?teacherId= | None | Get all quizzes for teacher |
| GET | /quizzes/:id | None | Get a specific quiz by ID |
| POST | /responses | None | Submit a single student response (kept for completeness) |
| GET | /responses?quizId= | None | Get all responses for a quiz |
| GET | /classes | None | Get preset class list (unused by frontend) |
| POST | /simulate | None | Generate bulk simulated responses for a quiz |

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
| Home page | ✅ Working | Landing page with demo flow overview |
| Create Question | ✅ Working | Validated, scoped by teacherId |
| Question Bank | ✅ Working | Backend-filtered by teacherId |
| Edit/delete questions | ✅ Working | PUT/DELETE /api/questions/:id; inline edit UI |
| Build Quiz | ✅ Working | Loads real questions from API, reorder + remove |
| Send Quiz | ✅ Working | POSTs quiz, calls /simulate, shows response count + analytics link |
| Simulated responses | ✅ Working | POST /api/simulate generates server-side bulk responses |
| Analytics | ✅ Working | Per-question breakdown, correct bar chart proportions |
| Quiz History | ✅ Working | Lists all quizzes, links to analytics |
| Preset classes | ✅ Working | 3 hardcoded classes (Yr9 Sci 28, Yr10 Maths 25, Yr7 Eng 22) |
| No-auth open access | ✅ Working | localStorage UUID, no login required |
| App Insights logging | ✅ Working | APPLICATIONINSIGHTS_CONNECTION_STRING set |
| Preview gallery | ✅ Working | Static mockup placeholders — replace with real images in public/gallery/ |
| Student flow | ❌ Removed | Demo is teacher-only; student view shown as mockup in Preview gallery |
| Push notifications | ❌ Post-MVP | Azure Notification Hubs — shown as mockup |
| Schedule quiz | ❌ Post-MVP | UI placeholder exists (disabled), backend not implemented |
| Quiz link expiry | ❌ Post-MVP | No closedAt field or expiry logic yet |
| Student auth | ❌ Post-MVP | Would use Microsoft school login |
| Admin & rostering | ❌ Post-MVP | — |
| LMS integration | ❌ Post-MVP | — |

## Known issues / pending cleanup

### 1. Dead code — delete in next session
- `src/pages/Login.jsx` — leftover MSAL login page, not routed anywhere
- `src/session.js` — `studentId` named export is unused (only `getSessionId` is used)
- `api/classes.js` — endpoint still deployed but frontend no longer calls it

### 2. Analytics empty state copy is stale
`Analytics.jsx:171` — empty state message still says "Share the quiz link with students to see results here."
Should say something like "No responses recorded for this quiz." — no student link exists anymore.

### 3. Quiz History shows no response counts
Each quiz row shows `classSize` but not actual response count. To fix: either store `responseCount`
on the quiz document at simulate time (cleanest), or fetch response counts per quiz on load (expensive).

### 4. SWA free tier does not proxy POST/PUT/DELETE
The `/api/*` rewrite rule in `staticwebapp.config.json` returns 405 for mutating HTTP methods.
Frontend calls the Function App URL directly. The SWA rewrite remains in config but is bypassed.
Long-term fix: upgrade SWA to Standard tier and use the linked backend feature.

### 5. Rate limiter is per-instance, not global
`rateLimit.js` uses an in-memory Map. State is not shared across Function App scale-out replicas.
Fine for demo scale; upgrade to Azure API Management for production.

### 6. Cosmos DB orphaned data
Visitors who clear localStorage get a new UUID — their old Cosmos DB documents are never cleaned up.
Acceptable for demo. Add a TTL policy on containers or a periodic cleanup Function if needed.

### 7. Function App must be deployed separately
GitHub Actions deploys the React frontend only. API changes require manual deploy:
```powershell
cd api
func azure functionapp publish quizpulse-api
```

## Post-MVP features (planned)

- Real screenshots/images in Preview gallery (add to `public/gallery/`, update `DemoGallery.jsx`)
- Fix stale Analytics empty state copy (see Known issues #2)
- Store `responseCount` on quiz at simulate time (see Known issues #3)
- Delete dead code: `Login.jsx`, `studentId` export in `session.js`, `api/classes.js`
- Quiz link expiry (`closedAt` field + "quiz is closed" screen)
- Student accounts with Microsoft school login
- Quiz scheduling (send later — UI placeholder exists, backend not implemented)
- School admin controls and bulk roster import
- CSV export from Analytics
- Native push notifications via Azure Notification Hubs (iOS + Android)
- LMS integration (Canvas, Schoolbox)
- Shared question bank across a school
- Cosmos DB TTL or cleanup Function for orphaned visitor data

## Coding conventions

- React functional components only, hooks for state
- Async/await for all API calls, always wrap in try/catch
- API calls use `API_BASE` imported from `src/api.js`
- In production `API_BASE` is the direct Function App URL — do not change to `/api`
- `teacherId` from `AuthContext` → `useAuth()` → sourced from `localStorage` via `session.js`
- No TypeScript — plain JavaScript throughout
- CSS is inline styles — no CSS modules or styled-components
- Azure Functions v4: use `context.error()` / `context.warn()` / `context.log()` — not `context.log.*`

## Build & deployment

```powershell
# Frontend — commit and push to develop, then PR to master
git add .
git commit -m "message"
git push
# → open PR develop → master → merge → GitHub Actions deploys frontend automatically

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

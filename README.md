# QuizPulse

Low-stakes classroom quiz app for secondary school teachers (Years 7–12). Teachers create questions, build quizzes, send them to a preset class, and view analytics. Student responses are simulated automatically — no real student flow exists in the current demo.

**Live demo:** https://mango-meadow-0a5aa7410.7.azurestaticapps.net

---

## Demo flow

1. **Home** — overview of the demo and links to get started
2. **Create questions** — build a question bank with multiple-choice questions across topics
3. **Question bank** — browse, edit, and delete saved questions
4. **Build quiz** — select questions, name the quiz, arrange order
5. **Send quiz** — choose one or more preset classes; responses are simulated instantly server-side
6. **Analytics** — per-question response breakdown and participation rate
7. **Preview gallery** — static mockups of the student view, push notifications, and other post-MVP features

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (SPA, React Router v6) |
| Hosting | Azure Static Web Apps (free tier, GitHub CI/CD) |
| Backend | Azure Functions — Node.js v4 runtime, HTTP-triggered, serverless |
| Database | Azure Cosmos DB (NoSQL, serverless mode) |
| Auth | Azure Static Web Apps Easy Auth — Entra ID (Simple mode) |
| Secret management | Azure Key Vault (Cosmos DB key via managed identity) |
| Logging | Azure Application Insights |

---

## Running locally

Three terminals required:

```powershell
# Terminal 1 — React dev server
npm run dev        # → localhost:5173

# Terminal 2 — Azure Functions
cd api
func start         # → localhost:7071

# Terminal 3 — Azurite storage emulator
azurite --silent
```

Auth is bypassed on localhost — `ProtectedRoute` passes through without a login redirect, and `teacherId` falls back to a stable `localStorage` UUID.

---

## Project structure

```
src/
  pages/
    Home.jsx              — landing page
    DemoGallery.jsx       — static mockup gallery
    teacher/
      CreateQuestion.jsx  — create and save questions
      QuestionBank.jsx    — browse, edit, delete questions
      BuildQuiz.jsx       — assemble a quiz from saved questions
      SendQuiz.jsx        — send quiz to a preset class, trigger simulation
      Analytics.jsx       — per-question response breakdown
  components/
    DemoNav.jsx           — persistent top nav bar
    AuthContext.jsx       — Entra ID auth context
  api.js                  — centralised API base URL
  App.jsx                 — router and global providers
api/
  questions.js            — GET/POST/PUT/DELETE /api/questions
  quizzes.js              — GET/POST /api/quizzes
  responses.js            — GET/POST /api/responses
  simulate.js             — POST /api/simulate (bulk response generation)
  classes.js              — GET /api/classes (preset class list)
  rateLimit.js            — in-memory sliding window rate limiter
  logger.js               — structured logging to Application Insights
```

---

## Preset classes

| Class | Students |
|---|---|
| Year 9 Science | 28 |
| Year 10 Maths | 25 |
| Year 7 English | 22 |

When a quiz is sent, `POST /api/simulate` generates one response document per student server-side in a single call, avoiding the per-IP rate limit on the `/responses` endpoint.

---

## Deployment

**Frontend** — push to `develop`, open a PR, merge to `master`. GitHub Actions deploys automatically (~1 min).

**API** — must be deployed manually whenever `api/` files change:

```powershell
cd api
func azure functionapp publish quizpulse-api
```

---

## Feature status

| Feature | Status |
|---|---|
| Home page | ✅ |
| Create / edit / delete questions | ✅ |
| Build quiz | ✅ |
| Send quiz with simulated responses | ✅ |
| Analytics | ✅ |
| Preset classes | ✅ |
| Teacher auth (Entra ID) | ✅ |
| Preview gallery (mockups) | ✅ |
| Push notifications | Post-MVP |
| Quiz scheduling | Post-MVP |
| Student accounts | Post-MVP |
| Admin & rostering | Post-MVP |
| LMS integration | Post-MVP |

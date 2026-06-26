const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// Allow-list: table param -> container name. 'pageviews' is a fixed name to
// match the rest of the codebase; the others come from env.
const TABLES = {
  questions: process.env.COSMOS_CONTAINER_QUESTIONS,
  quizzes:   process.env.COSMOS_CONTAINER_QUIZZES,
  responses: process.env.COSMOS_CONTAINER_RESPONSES,
  pageviews: 'pageviews',
};

// COUNT(1) returns a single scalar — cheap, no row bodies shipped.
async function count(container) {
  const { resources } = await container.items
    .query('SELECT VALUE COUNT(1) FROM c').fetchAll();
  return resources[0] ?? 0;
}

// DISTINCT values of a field (Cosmos has no COUNT(DISTINCT)).
async function distinctValues(container, field) {
  const { resources } = await container.items
    .query(`SELECT DISTINCT VALUE c.${field} FROM c`).fetchAll();
  return resources.filter(Boolean);
}

app.http('usageLog', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'usageLog',
  handler: async (request, context) => {
    try {
      const params = new URL(request.url).searchParams;
      const table = params.get('table');

      // ── Mode B: one table's rows, paged via continuation token ──────────
      if (table) {
        const containerName = TABLES[table];
        if (!containerName) {
          return { status: 400, jsonBody: { error: `Unknown table: ${table}` } };
        }
        const limit = Math.min(
          Math.max(parseInt(params.get('limit') || DEFAULT_LIMIT, 10) || DEFAULT_LIMIT, 1),
          MAX_LIMIT
        );
        const continuationToken = params.get('continuation') || undefined;

        // No ORDER BY — composite indexes aren't configured (see CLAUDE.md).
        const iterator = database.container(containerName).items.query(
          'SELECT * FROM c',
          { maxItemCount: limit, continuationToken }
        );
        const page = await iterator.fetchNext();

        return {
          status: 200,
          jsonBody: {
            table,
            rows: page.resources,
            continuation: page.continuationToken || null,
          }
        };
      }

      // ── Mode A: summary counts only — no row bodies ─────────────────────
      const questions = database.container(TABLES.questions);
      const quizzes   = database.container(TABLES.quizzes);
      const responses = database.container(TABLES.responses);
      const pageviews = database.container(TABLES.pageviews);

      const [
        questionsCount, quizzesCount, responsesCount, pageviewsCount,
        teachersFromQ, teachersFromZ, sessionIds,
      ] = await Promise.all([
        count(questions),
        count(quizzes),
        count(responses),
        count(pageviews).catch(() => 0),
        distinctValues(questions, 'teacherId').catch(() => []),
        distinctValues(quizzes, 'teacherId').catch(() => []),
        distinctValues(pageviews, 'sessionId').catch(() => []),
      ]);

      // Union of distinct teacherIds across questions + quizzes.
      const uniqueTeachers = new Set([...teachersFromQ, ...teachersFromZ]).size;
      const uniqueSessions = new Set(sessionIds).size;

      return {
        status: 200,
        jsonBody: {
          retrievedAt: new Date().toISOString(),
          pageSize: DEFAULT_LIMIT,
          counts: {
            questions: questionsCount,
            quizzes:   quizzesCount,
            responses: responsesCount,
            pageviews: pageviewsCount,
          },
          uniqueTeachers,
          uniqueSessions,
        }
      };
    } catch (err) {
      context.error('adminLog error', err);
      return { status: 500, jsonBody: { error: 'An unexpected error occurred' } };
    }
  }
});

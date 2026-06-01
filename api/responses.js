const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER_RESPONSES);

app.http('responses', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      if (request.method === 'GET') {
        const quizId = new URL(request.url).searchParams.get('quizId');

        if (!quizId) {
          return { status: 400, jsonBody: { error: 'quizId is required' } };
        }

        const { resources } = await container.items
          .query({ query: 'SELECT * FROM c WHERE c.quizId = @quizId', parameters: [{ name: '@quizId', value: quizId }] })
          .fetchAll();

        return { status: 200, jsonBody: resources };
      }

      if (request.method === 'POST') {
        const body = await request.json();

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Request body must be a JSON object' } };
        }

        const { quizId, answers, studentId } = body;

        if (typeof quizId !== 'string' || !quizId.trim()) {
          return { status: 400, jsonBody: { error: 'quizId is required and must be a string' } };
        }
        if (!Array.isArray(answers) || answers.length === 0) {
          return { status: 400, jsonBody: { error: 'answers must be a non-empty array' } };
        }
        if (answers.length > 50) {
          return { status: 400, jsonBody: { error: 'answers must contain 50 items or fewer' } };
        }
        for (const answer of answers) {
          if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
            return { status: 400, jsonBody: { error: 'each answer must be an object' } };
          }
          if (typeof answer.questionId !== 'string' || !answer.questionId.trim()) {
            return { status: 400, jsonBody: { error: 'each answer must have a questionId string' } };
          }
          if (typeof answer.selectedIndex !== 'number' || !Number.isInteger(answer.selectedIndex) || answer.selectedIndex < 0 || answer.selectedIndex > 3) {
            return { status: 400, jsonBody: { error: 'each answer.selectedIndex must be an integer between 0 and 3' } };
          }
        }

        const response = {
          id: require('crypto').randomUUID(),
          quizId: quizId.trim(),
          studentId: typeof studentId === 'string' && studentId.trim() ? studentId.trim().slice(0, 100) : require('crypto').randomUUID(),
          answers: answers.map(a => ({ questionId: a.questionId.trim(), selectedIndex: a.selectedIndex })),
          completedAt: new Date().toISOString()
        };

        const { resource } = await container.items.create(response);
        return { status: 201, jsonBody: resource };
      }

      return { status: 405, jsonBody: { error: 'Method not allowed' } };

    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
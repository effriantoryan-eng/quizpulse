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
        const { quizId, answers, studentId } = body;

        if (!quizId || !answers) {
          return { status: 400, jsonBody: { error: 'Missing required fields' } };
        }

        const response = {
          id: require('crypto').randomUUID(),
          quizId,
          studentId: studentId || require('crypto').randomUUID(),
          answers,
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
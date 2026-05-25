const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER_QUIZZES);

app.http('quizzes', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      if (request.method === 'GET') {
        const { resources } = await container.items.readAll().fetchAll();
        return { status: 200, jsonBody: resources };
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const { name, questionIds, classIds, teacherId } = body;

        if (!name || !questionIds) {
          return { status: 400, jsonBody: { error: 'Missing required fields' } };
        }

        const quiz = {
          id: require('crypto').randomUUID(),
          teacherId: teacherId || 'anonymous',
          name,
          questionIds,
          classIds: classIds || [],
          status: 'draft',
          sentAt: null,
          scheduledFor: null,
          createdAt: new Date().toISOString()
        };

        const { resource } = await container.items.create(quiz);
        return { status: 201, jsonBody: resource };
      }

      return { status: 405, jsonBody: { error: 'Method not allowed' } };

    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
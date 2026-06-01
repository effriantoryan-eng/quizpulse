const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER_QUESTIONS);

app.http('questions', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      if (request.method === 'GET') {
        const teacherId = new URL(request.url).searchParams.get('teacherId');

        if (!teacherId || !teacherId.trim()) {
          return { status: 400, jsonBody: { error: 'teacherId is required' } };
        }

        const { resources } = await container.items.query({
          query: 'SELECT * FROM c WHERE c.teacherId = @teacherId',
          parameters: [{ name: '@teacherId', value: teacherId.trim() }]
        }).fetchAll();

        return { status: 200, jsonBody: resources };
      }

      if (request.method === 'POST') {
        const body = await request.json();

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Request body must be a JSON object' } };
        }

        const { text, options, correctIndex, topic, teacherId } = body;

        const ALLOWED_TOPICS = ['Science', 'History', 'Mathematics', 'English', 'Geography'];

        if (typeof text !== 'string' || !text.trim()) {
          return { status: 400, jsonBody: { error: 'text is required and must be a string' } };
        }
        if (text.trim().length > 500) {
          return { status: 400, jsonBody: { error: 'text must be 500 characters or fewer' } };
        }
        if (!Array.isArray(options) || options.length !== 4) {
          return { status: 400, jsonBody: { error: 'options must be an array of exactly 4 items' } };
        }
        if (options.some(o => typeof o !== 'string' || !o.trim())) {
          return { status: 400, jsonBody: { error: 'each option must be a non-empty string' } };
        }
        if (options.some(o => o.trim().length > 200)) {
          return { status: 400, jsonBody: { error: 'each option must be 200 characters or fewer' } };
        }
        if (typeof correctIndex !== 'number' || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
          return { status: 400, jsonBody: { error: 'correctIndex must be an integer between 0 and 3' } };
        }
        if (!ALLOWED_TOPICS.includes(topic)) {
          return { status: 400, jsonBody: { error: `topic must be one of: ${ALLOWED_TOPICS.join(', ')}` } };
        }

        const question = {
          id: require('crypto').randomUUID(),
          teacherId: typeof teacherId === 'string' ? teacherId.trim().slice(0, 100) : 'anonymous',
          text: text.trim(),
          options: options.map(o => o.trim()),
          correctIndex,
          topic,
          createdAt: new Date().toISOString()
        };

        const { resource } = await container.items.create(question);
        return { status: 201, jsonBody: resource };
      }

      return { status: 405, jsonBody: { error: 'Method not allowed' } };

    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
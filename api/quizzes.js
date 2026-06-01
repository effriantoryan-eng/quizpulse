const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { rateLimit, getClientIp } = require('./rateLimit');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER_QUIZZES);

app.http('getQuizById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'quizzes/{id}',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      const teacherId = new URL(request.url).searchParams.get('teacherId');

      const { resources } = await container.items.query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }]
      }).fetchAll();

      if (resources.length === 0) {
        return { status: 404, jsonBody: { error: 'Quiz not found' } };
      }

      const quiz = resources[0];

      // Ownership check — only enforced for teacher requests (teacherId present).
      // Student requests via TakeQuiz do not send a teacherId and are allowed through.
      if (teacherId && quiz.teacherId !== teacherId.trim()) {
        return { status: 403, jsonBody: { error: 'You do not have access to this quiz' } };
      }

      return { status: 200, jsonBody: quiz };
    } catch (err) {
      context.log.error('quizzes error:', err.message);
      return { status: 500, jsonBody: { error: 'An unexpected error occurred' } };
    }
  }
});

app.http('quizzes', {
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
        const ip = getClientIp(request);
        if (!rateLimit(`quizzes:${ip}`, 10, 60000)) {
          return { status: 429, jsonBody: { error: 'Too many requests. Please try again later.' } };
        }

        const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
        if (contentLength > 65536) {
          return { status: 413, jsonBody: { error: 'Request body too large. Maximum size is 64KB' } };
        }

        const body = await request.json();

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Request body must be a JSON object' } };
        }

        const { name, questionIds, classIds, teacherId, status, sentAt } = body;

        const ALLOWED_STATUSES = ['draft', 'sent', 'scheduled'];

        if (typeof name !== 'string' || !name.trim()) {
          return { status: 400, jsonBody: { error: 'name is required and must be a string' } };
        }
        if (name.trim().length > 200) {
          return { status: 400, jsonBody: { error: 'name must be 200 characters or fewer' } };
        }
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
          return { status: 400, jsonBody: { error: 'questionIds must be a non-empty array' } };
        }
        if (questionIds.length > 50) {
          return { status: 400, jsonBody: { error: 'questionIds must contain 50 items or fewer' } };
        }
        if (questionIds.some(id => typeof id !== 'string' || !id.trim())) {
          return { status: 400, jsonBody: { error: 'each questionId must be a non-empty string' } };
        }
        if (classIds !== undefined && !Array.isArray(classIds)) {
          return { status: 400, jsonBody: { error: 'classIds must be an array' } };
        }
        if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
          return { status: 400, jsonBody: { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` } };
        }

        const quiz = {
          id: require('crypto').randomUUID(),
          teacherId: typeof teacherId === 'string' ? teacherId.trim().slice(0, 100) : 'anonymous',
          name: name.trim(),
          questionIds: questionIds.map(id => id.trim()),
          classIds: Array.isArray(classIds) ? classIds.map(id => String(id).trim().slice(0, 100)) : [],
          status: status || 'draft',
          sentAt: sentAt || null,
          scheduledFor: null,
          createdAt: new Date().toISOString()
        };

        const { resource } = await container.items.create(quiz);
        return { status: 201, jsonBody: resource };
      }

      return { status: 405, jsonBody: { error: 'Method not allowed' } };

    } catch (err) {
      context.log.error('quizzes error:', err.message);
      return { status: 500, jsonBody: { error: 'An unexpected error occurred' } };
    }
  }
});
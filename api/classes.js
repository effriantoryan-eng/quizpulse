const { app } = require('@azure/functions');
const { logRequest } = require('./logger');

const CLASSES = [
  { id: 'yr9-sci-p3', name: 'Year 9 Science — Period 3', students: 28, topic: 'Science' },
  { id: 'yr9-sci-p5', name: 'Year 9 Science — Period 5', students: 26, topic: 'Science' },
  { id: 'yr10-bio-p2', name: 'Year 10 Biology — Period 2', students: 24, topic: 'Science' },
];

app.http('classes', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const start = Date.now();
    logRequest(context, { endpoint: 'classes', method: 'GET', status: 200, durationMs: Date.now() - start });
    return { status: 200, jsonBody: CLASSES };
  }
});

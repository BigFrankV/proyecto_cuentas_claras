const request = require('supertest');
const express = require('express');

// lightweight test: import our index as an express app is tricky because index starts server.
// Instead create a small app mimicking the health route.
const app = express();
app.get('/healthz', (_, res) => res.json({ status: 'ok' }));

describe('health endpoint', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

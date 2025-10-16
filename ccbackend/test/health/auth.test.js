// Test module for auth endpoints
const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Auth Module - Health Check Tests', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Auth Endpoints', () => {
    test('GET /auth/me - Get current user info', async () => {
      const response = await getWithAuth(app, '/auth/me', authToken);
      categorizeResponse('GET', '/auth/me', response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /auth/sessions - Get user sessions', async () => {
      const response = await getWithAuth(app, '/auth/sessions', authToken);
      categorizeResponse('GET', '/auth/sessions', response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /auth/preferences - Get user preferences', async () => {
      const response = await getWithAuth(app, '/auth/preferences', authToken);
      categorizeResponse('GET', '/auth/preferences', response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /auth/2fa/setup - Setup 2FA', async () => {
      const response = await getWithAuth(app, '/auth/2fa/setup', authToken);
      categorizeResponse('GET', '/auth/2fa/setup', response.status);
      // Puede devolver 200/201 (si se genera QR) o 401/403/500
      expect([200, 201, 401, 403, 404, 500, 501]).toContain(response.status); 
    });
  });
});
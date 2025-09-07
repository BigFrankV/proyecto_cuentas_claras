const { createClient } = require('redis');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });
client.on('error', (err) => logger.error('Redis Client Error: %s', err && err.message));

async function connectRedis() {
  if (process.env.REDIS_DISABLED === 'true') {
    logger.info('Redis disabled via REDIS_DISABLED=true');
    return false;
  }
  try {
    if (!client.isOpen) await client.connect();
    logger.info('Connected to Redis at %s', redisUrl);
    return true;
  } catch (err) {
    // Don't rethrow: make Redis optional so app can start without it
    logger.warn('Could not connect to Redis (%s). Continuing without cache. Error: %s', redisUrl, err && err.message);
    return false;
  }
}

module.exports = { client, connectRedis };

const axios = require('axios');
const { redis } = require('../config/redis');
const { oauth } = require('../config/env');
const { logger } = require('../utils/logger');

const TOKEN_KEY = 'oauth2:access_token';
const LOCK_KEY = 'oauth2:access_token:lock';

async function getAccessToken() {
  // 1) Cache check
  const cached = await redis.get(TOKEN_KEY);
  if (cached) {
    return cached;
  }

  // 2) Lock to avoid parallel fetch
  const lock = await redis.set(LOCK_KEY, '1', 'NX', 'EX', 5);
  if (!lock) {
    await new Promise((r) => setTimeout(r, 300));
    const cachedAfterWait = await redis.get(TOKEN_KEY);
    if (cachedAfterWait) {
      return cachedAfterWait;
    }
  }

  try {
    // 3) Auth0 client_credentials request
    const body = {
      grant_type: 'client_credentials',
      client_id: oauth.clientId,
      client_secret: oauth.clientSecret,
      audience: oauth.audience,
    };

    const res = await axios.post(oauth.tokenUrl, body, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });

    const token = res.data.access_token;
    const expiresIn = res.data.expires_in || 3600;

    if (!token) {
      throw new Error('No access_token in OAuth response');
    }

    const ttl = Math.max(expiresIn - 30, 60);
    await redis.set(TOKEN_KEY, token, 'EX', ttl);

    logger.info(`Fetched new OAuth token, ttl=${ttl}s`);
    return token;
  } catch (err) {
    logger.error('Error fetching OAuth token', {
      message: err.message,
      response: err.response?.data,
    });
    throw err;
  } finally {
    await redis.del(LOCK_KEY);
  }
}

module.exports = { getAccessToken };



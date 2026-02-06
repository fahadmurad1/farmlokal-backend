const axios = require('axios');
const { createBreaker } = require('../reliability/circuitBreaker');
const { logger } = require('../utils/logger');

// Simple exponential backoff retry helper
async function fetchWithRetries(url, maxRetries = 3, baseDelayMs = 300) {
  let attempt = 0;

  while (true) {
    try {
      const res = await axios.get(url, { timeout: 4000 }); // timeout handling
      return res.data;
    } catch (err) {
      attempt += 1;
      const isLastAttempt = attempt > maxRetries;

      if (isLastAttempt) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1); // 300, 600, 1200...
      logger.warn(
        `External API failed (attempt ${attempt}), retrying in ${delay}ms`
      );

      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Function that breaker will wrap
async function fetchExternalProductsRaw() {
  // Use any fake product/ order API here
  const url = 'https://fakestoreapi.com/products?limit=5';
  return await fetchWithRetries(url);
}

// Wrap with circuit breaker
const breaker = createBreaker(fetchExternalProductsRaw);

breaker.on('open', () => logger.warn('Sync external API breaker OPEN'));
breaker.on('close', () => logger.info('Sync external API breaker CLOSED'));
breaker.on('halfOpen', () => logger.info('Sync external API breaker HALF-OPEN'));

async function getExternalProducts() {
  try {
    const data = await breaker.fire();
    return data;
  } catch (err) {
    logger.error('External sync API failed after retries & breaker', err);
    // graceful degradation: return empty array instead of crashing
    return [];
  }
}

module.exports = { getExternalProducts };


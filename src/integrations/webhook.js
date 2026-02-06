// src/integrations/webhook.js
const express = require('express');
const { redis } = require('../config/redis');
const { logger } = require('../utils/logger');

const router = express.Router();

router.post('/external/webhook', async (req, res) => {
  const { eventId, type, payload } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId required' });
  }

  const key = `webhook:${eventId}`;

  try {
    
    const processed = await redis.get(key);
    if (processed) {
      
      logger.info(`Webhook duplicate ignored: ${eventId}`);
      return res.status(200).json({ status: 'duplicate_ignored' });
    }

   
    logger.info(`Processing webhook event ${eventId} of type ${type}`);

    
    await redis.set(key, 'processed', 'EX', 24 * 60 * 60); // 24 hours

    return res.json({ status: 'ok' });
  } catch (err) {
    logger.error('Webhook processing failed', err);

   
    return res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;



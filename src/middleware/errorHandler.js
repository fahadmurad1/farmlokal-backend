const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };

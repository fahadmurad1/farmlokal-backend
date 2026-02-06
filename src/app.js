const path = require('path');
const express = require('express');
const { port } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');
const { metricsHandler } = require('./middleware/metrics');
const productsRouter = require('./products/product.controller');
const webhookRouter = require('./integrations/webhook');
const authTestRouter = require('./auth/authTest.controller');
const syncApiRouter = require('./integrations/syncApi.controller');
const protectedApiRouter = require('./integrations/protectedApi.controller');


const app = express();
app.use(express.json());

// OAuth demo + external sync API
app.use(authTestRouter);
app.use(syncApiRouter);

// static UI
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', metricsHandler);

// rate limiting
app.use('/products', apiLimiter);
app.use('/external', apiLimiter);

// main routers
app.use(productsRouter);
app.use(webhookRouter);
app.use(protectedApiRouter);

// error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});



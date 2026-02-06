function metricsHandler(req, res) {
  // for now just a simple OK; can extend with real metrics
  res.type('text/plain').send('metrics_placeholder 1\n');
}

module.exports = { metricsHandler };

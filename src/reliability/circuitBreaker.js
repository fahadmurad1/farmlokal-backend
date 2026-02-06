const CircuitBreaker = require('opossum');

function createBreaker(fn) {
  return new CircuitBreaker(fn, {
    timeout: 5000,              // function must complete in 5s
    errorThresholdPercentage: 50, // 50% failures -> open
    resetTimeout: 10000,        // after 10s, half-open
  });
}

module.exports = { createBreaker };


const express = require('express');
const { getExternalProducts } = require('./syncApi');

const router = express.Router();


router.get('/external/products', async (req, res, next) => {
  try {
    const items = await getExternalProducts();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

module.exports = router;


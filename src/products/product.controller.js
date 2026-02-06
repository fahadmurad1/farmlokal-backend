const express = require('express');
const { listProducts } = require('./product.service');

const router = express.Router();

router.get('/products', async (req, res, next) => {
  try {
    const {
      after,
      limit = '20',
      sort = 'createdAt:desc',
      search,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    const data = await listProducts({
      after: after ? Number(after) : undefined,
      limit: Number(limit),
      sort,
      search,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

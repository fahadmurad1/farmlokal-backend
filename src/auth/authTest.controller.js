const express = require('express');
const { getAccessToken } = require('./oauthClient');

const router = express.Router();

router.get('/auth/test-token', async (req, res, next) => {
  try {
    const token = await getAccessToken();
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


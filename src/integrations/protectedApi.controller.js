const express = require('express');
const axios = require('axios');
const { getAccessToken } = require('../auth/oauthClient');

const router = express.Router();


router.get('/external/secure-data', async (req, res, next) => {
  try {
    const token = await getAccessToken();

   
    const response = await axios.get('https://example.com/protected-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    res.json({ data: response.data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

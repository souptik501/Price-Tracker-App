const express = require('express');
const { buildSmartQuery } = require('../queryBuilder');
const { searchPrices } = require('../priceSearch');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query required' });
    }
    const smartQuery = await buildSmartQuery(query);
    const priceResults = await searchPrices(smartQuery);
    const sorted = priceResults.sort((a, b) => a.price - b.price);
    return res.json({ query: smartQuery, results: sorted });
  } catch (error) {
    console.error('Search route error', error.message || error);
    return res.status(500).json({ error: 'Backend search failed' });
  }
});

module.exports = router;

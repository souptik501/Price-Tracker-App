const axios = require('axios');

const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json';

const trustedStores = [
  { match: 'amazon', site: 'Amazon India', logo: 'AMZ' },
  { match: 'flipkart', site: 'Flipkart', logo: 'FK' },
  { match: 'meesho', site: 'Meesho', logo: 'MS' },
  { match: 'nykaa', site: 'Nykaa', logo: 'NYK' },
  { match: 'snapdeal', site: 'Snapdeal', logo: 'SND' },
  { match: 'blinkit', site: 'Blinkit', logo: 'BLK' },
  { match: 'zepto', site: 'Zepto', logo: 'ZPT' },
];

const mockResults = (query) => [
  {
    site: 'Amazon India',
    title: `${query} (demo result)`,
    price: 1999,
    url: 'https://www.amazon.in/',
    thumbnail: 'https://placehold.co/240x180?text=Amazon',
    logo: 'AMZ',
  },
  {
    site: 'Flipkart',
    title: `${query} (demo result)`,
    price: 1899,
    url: 'https://www.flipkart.com/',
    thumbnail: 'https://placehold.co/240x180?text=Flipkart',
    logo: 'FK',
  },
  {
    site: 'Nykaa',
    title: `${query} (demo result)`,
    price: 2099,
    url: 'https://www.nykaa.com/',
    thumbnail: 'https://placehold.co/240x180?text=Nykaa',
    logo: 'NYK',
  },
];

const parsePrice = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/,/g, '').match(/\d+(\.\d+)?/);
  if (!cleaned) return null;

  const price = Number(cleaned[0]);
  return Number.isFinite(price) && price > 0 ? price : null;
};

const resolveStore = (item) => {
  const haystack = [
    item.source,
    item.seller,
    item.merchant,
    item.name,
    item.link,
    item.product_link,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return trustedStores.find((store) => haystack.includes(store.match)) || {
    site: item.source || item.seller || 'Google Shopping',
    logo: 'SHOP',
  };
};

const normalizeShoppingResult = (item, query) => {
  const price = parsePrice(item.extracted_price ?? item.price);
  if (!price) return null;

  const store = resolveStore(item);

  return {
    site: store.site,
    title: item.title || item.product_title || query,
    price,
    url: item.link || item.product_link || item.serpapi_product_api || 'https://shopping.google.com/',
    thumbnail: item.thumbnail || item.image || 'https://placehold.co/240x180?text=Product',
    logo: store.logo,
  };
};

const dedupeResults = (results) => {
  const seen = new Set();

  return results.filter((result) => {
    const key = `${result.site}|${result.title}|${result.price}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getSerpApiKey = () => {
  const key = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;
  const trimmedKey = key?.trim();

  if (!trimmedKey || trimmedKey === 'your_serpapi_key_here') {
    return null;
  }

  return trimmedKey;
};

const searchPrices = async (query) => {
  const serpKey = getSerpApiKey();

  if (!serpKey) {
    return mockResults(query);
  }

  const params = {
    engine: 'google_shopping',
    q: query,
    api_key: serpKey,
    gl: 'in',
    hl: 'en',
    google_domain: 'google.co.in',
  };

  const response = await axios.get(SERPAPI_ENDPOINT, { params, timeout: 15000 });
  const shoppingResults = response.data.shopping_results || [];
  const normalized = shoppingResults
    .map((item) => normalizeShoppingResult(item, query))
    .filter(Boolean);

  return dedupeResults(normalized).slice(0, 24);
};

module.exports = { searchPrices };

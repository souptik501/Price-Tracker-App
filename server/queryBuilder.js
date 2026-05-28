const noiseWords = new Set([
  'best',
  'buy',
  'cheap',
  'cheapest',
  'compare',
  'deal',
  'deals',
  'discount',
  'for',
  'india',
  'lowest',
  'online',
  'price',
  'prices',
  'under',
]);

const buildSmartQuery = async (rawSearch) => {
  const words = String(rawSearch)
    .trim()
    .replace(/[^\w\s.+-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const cleanedWords = words.filter((word) => !noiseWords.has(word.toLowerCase()));
  const cleaned = cleanedWords.join(' ').replace(/\s+/g, ' ').trim();

  return cleaned || String(rawSearch).trim();
};

module.exports = { buildSmartQuery };

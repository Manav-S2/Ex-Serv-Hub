/**
 * PIB (Press Information Bureau) RSS Scraper
 * Parses the PIB RSS feed for defence/ESM job-related press releases
 */

const Parser = require('rss-parser');

const PIB_RSS_MINISTRY_DEFENCE =
  'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3'; // MoD press releases
const PIB_RSS_GENERAL =
  'https://pib.gov.in/RssMain.aspx?ModId=3&Lang=1&Regid=3'; // General

const ESM_KEYWORDS = [
  'ex-servicemen',
  'ex servicemen',
  'esm',
  'veteran',
  'resettlement',
  'dgr',
  'kendriya sainik',
  'ksb',
  'desw',
  'recruitment',
  'job fair',
  'employment',
  'vacancy',
  'vacancies',
  'placement',
  'sainik',
];

function makeId(title, dateStr) {
  const slug = (title + dateStr)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  return `pib-${slug}`;
}

function isRelevant(text) {
  const lower = (text || '').toLowerCase();
  return ESM_KEYWORDS.some((kw) => lower.includes(kw));
}

async function scrapePIB() {
  const jobs = [];
  const parser = new Parser({ timeout: 15000 });

  const feeds = [PIB_RSS_MINISTRY_DEFENCE, PIB_RSS_GENERAL];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items || []) {
        const title = item.title || '';
        const summary = item.contentSnippet || item.content || '';
        const link = item.link || '';
        const pubDate = item.pubDate || item.isoDate || '';

        if (!isRelevant(title) && !isRelevant(summary)) continue;

        jobs.push({
          id: makeId(title, pubDate),
          title: title.trim(),
          org: 'PIB / Govt',
          category: 'Govt',
          description: summary.trim().substring(0, 300) || 'Government press release. Click "View Details" for full information.',
          state: 'Pan India',
          eligibility: 'As per notification',
          postedDate: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          closingDate: '',
          eventDate: null,
          status: 'active',
          source: 'PIB',
          sourceUrl: link || 'https://pib.gov.in/',
          vacancies: null,
          tags: ['PIB', 'Press Release', 'Govt'],
          scrapedAt: new Date().toISOString(),
        });
      }

      console.log(`[PIB Scraper] Feed ${feedUrl}: found relevant items`);
    } catch (err) {
      console.error(`[PIB Scraper] Error on ${feedUrl}:`, err.message);
    }
  }

  console.log(`[PIB Scraper] Total relevant PIB items: ${jobs.length}`);
  return jobs;
}

module.exports = { scrapePIB };

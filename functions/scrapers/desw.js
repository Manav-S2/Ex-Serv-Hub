/**
 * DESW (Department of Ex-Servicemen Welfare) Scraper
 * Scrapes employment-related circulars and notifications from desw.gov.in
 */

const axios = require('axios');
const cheerio = require('cheerio');

const DESW_BASE = 'http://desw.gov.in';
const DESW_URL = 'http://desw.gov.in/';

const EMPLOYMENT_KEYWORDS = [
  'employ',
  'job',
  'vacanc',
  'recruit',
  'placement',
  'resettlement',
  'circular',
  'notification',
  'scheme',
  'welfare',
  'reservation',
];

function makeId(title, date) {
  const slug = (title + date)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  return `desw-${slug}`;
}

function isRelevant(text) {
  const lower = (text || '').toLowerCase();
  return EMPLOYMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function scrapeDESW() {
  const jobs = [];

  try {
    const { data } = await axios.get(DESW_URL, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Scan all anchor tags for relevant employment/welfare items
    $('a').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';

      if (text.length < 10) return;
      if (!isRelevant(text) && !isRelevant(href)) return;

      const fullLink = href.startsWith('http')
        ? href
        : href
        ? `${DESW_BASE}/${href.replace(/^\//, '')}`
        : DESW_URL;

      jobs.push({
        id: makeId(text, ''),
        title: text,
        org: 'DESW',
        category: 'Govt',
        description:
          'DESW circular / notification for ex-servicemen welfare & employment. Click "View Details" for full information.',
        state: 'Pan India',
        eligibility: 'Ex-Servicemen as per circular',
        postedDate: new Date().toISOString().split('T')[0],
        closingDate: '',
        eventDate: null,
        status: 'active',
        source: 'DESW',
        sourceUrl: fullLink,
        vacancies: null,
        tags: ['DESW', 'Circular', 'Welfare'],
        scrapedAt: new Date().toISOString(),
      });
    });

    console.log(`[DESW Scraper] Found ${jobs.length} relevant items`);
  } catch (err) {
    console.error('[DESW Scraper] Error:', err.message);
  }

  return jobs;
}

module.exports = { scrapeDESW };

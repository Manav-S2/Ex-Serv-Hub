/**
 * KSB (Kendriya Sainik Board) Scraper
 * Scrapes job fairs, resettlement camps, and welfare employment listings from ksb.gov.in
 */

const axios = require('axios');
const cheerio = require('cheerio');

const KSB_BASE = 'https://www.ksb.gov.in';
const KSB_NOTICES_URL = 'https://www.ksb.gov.in/notice.htm';

function makeId(source, title, date) {
  const slug = (title + date)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  return `${source}-${slug}`;
}

function inferStatus(closingDateStr) {
  if (!closingDateStr) return 'active';
  try {
    const date = new Date(closingDateStr);
    if (isNaN(date.getTime())) return 'active';
    const diffDays = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'closed';
    if (diffDays <= 7) return 'closing-soon';
    return 'active';
  } catch {
    return 'active';
  }
}

async function scrapeKSB() {
  const jobs = [];

  try {
    const { data } = await axios.get(KSB_NOTICES_URL, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // KSB notice board — typically a table with notice title, date, and PDF link
    $('table tr').each((i, row) => {
      if (i === 0) return;
      const cells = $(row).find('td');
      if (cells.length < 1) return;

      const titleEl = cells.eq(0);
      const title = titleEl.text().trim();
      if (!title || title.length < 5) return;

      // Filter for employment-related notices only
      const lowerTitle = title.toLowerCase();
      const isJobRelated =
        lowerTitle.includes('job') ||
        lowerTitle.includes('employ') ||
        lowerTitle.includes('vacanc') ||
        lowerTitle.includes('recruit') ||
        lowerTitle.includes('fair') ||
        lowerTitle.includes('placement') ||
        lowerTitle.includes('resettlement') ||
        lowerTitle.includes('camp');

      if (!isJobRelated) return;

      const link = titleEl.find('a').attr('href') || '';
      const fullLink = link.startsWith('http')
        ? link
        : link
        ? `${KSB_BASE}/${link.replace(/^\//, '')}`
        : KSB_NOTICES_URL;

      const dateText = cells.length > 1 ? cells.eq(1).text().trim() : '';

      jobs.push({
        id: makeId('ksb', title, dateText),
        title,
        org: 'KSB',
        category: 'KSB',
        description:
          'KSB notice for ex-servicemen employment. Click "View Details" for full information.',
        state: 'Pan India',
        eligibility: 'Ex-Servicemen and ESM widows',
        postedDate: dateText || new Date().toISOString().split('T')[0],
        closingDate: '',
        eventDate: null,
        status: inferStatus(''),
        source: 'KSB',
        sourceUrl: fullLink,
        vacancies: null,
        tags: ['KSB', 'Welfare'],
        scrapedAt: new Date().toISOString(),
      });
    });

    // Fallback: scan all anchor tags for employment-related links
    if (jobs.length === 0) {
      $('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        const lowerText = text.toLowerCase();
        if (
          text.length > 10 &&
          (lowerText.includes('job') ||
            lowerText.includes('fair') ||
            lowerText.includes('placement') ||
            lowerText.includes('resettlement') ||
            lowerText.includes('employ'))
        ) {
          const fullLink = href.startsWith('http')
            ? href
            : href
            ? `${KSB_BASE}/${href.replace(/^\//, '')}`
            : KSB_NOTICES_URL;

          jobs.push({
            id: makeId('ksb', text, ''),
            title: text,
            org: 'KSB',
            category: 'KSB',
            description: 'KSB employment notice.',
            state: 'Pan India',
            eligibility: 'Ex-Servicemen',
            postedDate: new Date().toISOString().split('T')[0],
            closingDate: '',
            eventDate: null,
            status: 'active',
            source: 'KSB',
            sourceUrl: fullLink,
            vacancies: null,
            tags: ['KSB'],
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`[KSB Scraper] Found ${jobs.length} job-related notices`);
  } catch (err) {
    console.error('[KSB Scraper] Error:', err.message);
  }

  return jobs;
}

module.exports = { scrapeKSB };

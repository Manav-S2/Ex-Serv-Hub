/**
 * AWPO (Army Welfare Placement Organisation) Scraper
 * Scrapes veteran opportunities and vacancies from AWPO portals
 */
const axios = require('axios');
const cheerio = require('cheerio');
const { generateJobFingerprint, calculateStatus, cleanString } = require('../utils/dedup');

const AWPO_BASE = 'http://www.awpo.org.in';
const AWPO_VACANCIES = 'http://www.awpo.org.in/vacancies.html';

async function scrapeAWPO() {
  const jobs = [];

  try {
    const { data } = await axios.get(AWPO_VACANCIES, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Parse tables or list rows
    $('table tr').each((i, row) => {
      if (i === 0) return; // skip header
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const title = cleanString(cells.eq(0).text());
      if (!title || title.length < 5) return;

      const link = cells.eq(0).find('a').attr('href') || '';
      const fullLink = link.startsWith('http') ? link : `${AWPO_BASE}/${link.replace(/^\//, '')}`;
      const location = cleanString(cells.eq(1).text()) || 'Pan India';
      const closingDate = cells.length > 2 ? cleanString(cells.eq(2).text()) : '';

      jobs.push({
        id: generateJobFingerprint('awpo', title, 'AWPO'),
        title,
        org: 'AWPO',
        category: 'Corporate / Placement',
        description: `Army Welfare Placement Organisation posting. Suitable for retired Armed Forces personnel.`,
        state: location,
        eligibility: 'Ex-Servicemen (Officers / JCOs / OR as specified)',
        postedDate: new Date().toISOString().split('T')[0],
        closingDate: closingDate || '',
        eventDate: null,
        status: calculateStatus(closingDate),
        source: 'AWPO',
        sourceUrl: fullLink || AWPO_BASE,
        vacancies: null,
        tags: ['AWPO', 'Placement', 'Armed Forces'],
        scrapedAt: new Date().toISOString(),
      });
    });

    console.log(`[AWPO Scraper] Found ${jobs.length} listings`);
  } catch (err) {
    console.error('[AWPO Scraper] Error fetching AWPO:', err.message);
  }

  return jobs;
}

module.exports = { scrapeAWPO };

/**
 * DGR India Scraper
 * Scrapes job fair notices and vacancy announcements from dgrindia.gov.in
 */

const axios = require('axios');
const cheerio = require('cheerio');

const DGR_URL = 'http://dgrindia.gov.in/';
const DGR_JOBS_URL = 'http://dgrindia.gov.in/Jobs.aspx';

/**
 * Generate a stable ID from a job title + date to prevent duplicates
 */
function makeId(source, title, date) {
  const slug = (title + date)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  return `${source}-${slug}`;
}

/**
 * Determine job status from closing date string
 */
function inferStatus(closingDateStr) {
  if (!closingDateStr) return 'active';
  try {
    // Parse common Indian date formats: "15 Aug 2026", "15/08/2026"
    const date = new Date(closingDateStr);
    if (isNaN(date.getTime())) return 'active';
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'closed';
    if (diffDays <= 7) return 'closing-soon';
    return 'active';
  } catch {
    return 'active';
  }
}

async function scrapeDGR() {
  const jobs = [];

  try {
    const { data } = await axios.get(DGR_JOBS_URL, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // DGR typically lists jobs in tables or list items — adapt selectors if they change
    // Try table rows first
    $('table tr').each((i, row) => {
      if (i === 0) return; // skip header row
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const titleEl = cells.eq(0);
      const title = titleEl.text().trim();
      if (!title || title.length < 5) return;

      const link = titleEl.find('a').attr('href') || '';
      const fullLink = link.startsWith('http') ? link : `http://dgrindia.gov.in/${link}`;
      const dateText = cells.eq(1).text().trim();
      const closingText = cells.length > 2 ? cells.eq(2).text().trim() : '';

      const job = {
        id: makeId('dgr', title, dateText),
        title,
        org: 'DGR',
        category: 'DGR',
        description: `Job opportunity listed on DGR India portal. Click "View Details" for full information.`,
        state: 'Pan India',
        eligibility: 'Ex-Servicemen as per DGR norms',
        postedDate: dateText || new Date().toISOString().split('T')[0],
        closingDate: closingText || '',
        eventDate: null,
        status: inferStatus(closingText),
        source: 'DGR India',
        sourceUrl: fullLink || DGR_JOBS_URL,
        vacancies: null,
        tags: ['DGR', 'Official'],
        scrapedAt: new Date().toISOString(),
      };

      jobs.push(job);
    });

    // Also try list items / anchor tags if table approach yielded nothing
    if (jobs.length === 0) {
      $('a').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        // Filter for job-related links
        if (
          text.length > 10 &&
          (href.toLowerCase().includes('job') ||
            href.toLowerCase().includes('vacanc') ||
            href.toLowerCase().includes('recruit') ||
            text.toLowerCase().includes('job fair') ||
            text.toLowerCase().includes('vacanc'))
        ) {
          const fullLink = href.startsWith('http')
            ? href
            : `http://dgrindia.gov.in/${href}`;
          jobs.push({
            id: makeId('dgr', text, ''),
            title: text,
            org: 'DGR',
            category: 'DGR',
            description: 'DGR job listing. Click "View Details" for full information.',
            state: 'Pan India',
            eligibility: 'Ex-Servicemen',
            postedDate: new Date().toISOString().split('T')[0],
            closingDate: '',
            eventDate: null,
            status: 'active',
            source: 'DGR India',
            sourceUrl: fullLink,
            vacancies: null,
            tags: ['DGR'],
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`[DGR Scraper] Found ${jobs.length} jobs`);
  } catch (err) {
    console.error('[DGR Scraper] Error:', err.message);
    // Return empty — scraper failure should not crash the whole function
  }

  return jobs;
}

module.exports = { scrapeDGR };

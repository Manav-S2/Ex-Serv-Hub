/**
 * Deduplication & Normalization Helper for Scraped Listings
 */
const crypto = require('crypto');

function cleanString(str) {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Generate a deterministic hash ID for a job listing
 * @param {string} source - e.g. 'dgr', 'ksb', 'awpo', 'desw'
 * @param {string} title - Job or Fair title
 * @param {string} org - Organization or posting department
 * @param {string} date - Posted or event date
 * @returns {string} Unique ID
 */
function generateJobFingerprint(source, title, org = '', date = '') {
  const normalized = [
    source.toLowerCase(),
    cleanString(title).toLowerCase().replace(/[^a-z0-9]/g, ''),
    cleanString(org).toLowerCase().replace(/[^a-z0-9]/g, ''),
  ].join('|');

  const hash = crypto.createHash('md5').update(normalized).digest('hex').substring(0, 12);
  const slug = cleanString(title)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  return `${source}-${slug}-${hash}`;
}

/**
 * Infer job status based on closing date string
 */
function calculateStatus(closingDateStr) {
  if (!closingDateStr) return 'active';
  try {
    const closing = new Date(closingDateStr);
    if (isNaN(closing.getTime())) return 'active';
    const now = new Date();
    const diffDays = Math.ceil((closing - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'closed';
    if (diffDays <= 7) return 'closing-soon';
    return 'active';
  } catch {
    return 'active';
  }
}

module.exports = {
  cleanString,
  generateJobFingerprint,
  calculateStatus,
};

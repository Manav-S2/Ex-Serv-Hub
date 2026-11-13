/**
 * Firebase Cloud Functions — ESM Hub Job Scraper
 *
 * Two functions:
 * 1. scheduledScrapeJobs  — runs every 12 hours, scrapes DGR/KSB/PIB/DESW
 * 2. seedJobs             — HTTP function (call once) to seed Firestore with curated past listings
 * 3. manualScrape         — HTTP function for on-demand scraping during development
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const { scrapeDGR } = require('./scrapers/dgr');
const { scrapeKSB } = require('./scrapers/ksb');
const { scrapePIB } = require('./scrapers/pib');
const { scrapeDESW } = require('./scrapers/desw');
const { scrapeAWPO } = require('./scrapers/awpo');
const SEED_JOBS = require('./seed_jobs.json');

// ─────────────────────────────────────────────────────────
// HELPER: Write jobs to Firestore, skipping duplicates
// ─────────────────────────────────────────────────────────
async function writeJobsToFirestore(jobs) {
  if (!jobs || jobs.length === 0) return 0;

  const batch = db.batch();
  let count = 0;

  for (const job of jobs) {
    if (!job.id || !job.title) continue;

    const ref = db.collection('jobs').doc(job.id);
    const existing = await ref.get();

    // Never overwrite manually curated/seed jobs
    if (existing.exists && existing.data().source === 'SEED') continue;

    // Auto-update status for scraped jobs based on closing date
    if (job.closingDate && job.status !== 'closed') {
      const closing = new Date(job.closingDate);
      if (!isNaN(closing.getTime())) {
        const diffDays = Math.ceil((closing - new Date()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) job.status = 'closed';
        else if (diffDays <= 7) job.status = 'closing-soon';
        else job.status = 'active';
      }
    }

    batch.set(ref, {
      ...job,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: existing.exists
        ? existing.data().createdAt
        : admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    count++;
  }

  await batch.commit();
  return count;
}

// ─────────────────────────────────────────────────────────
// FUNCTION 1: Scheduled scraper — runs every 12 hours
// ─────────────────────────────────────────────────────────
exports.scheduledScrapeJobs = functions
  .runWith({ timeoutSeconds: 300, memory: '512MB' })
  .pubsub.schedule('every 12 hours')
  .onRun(async () => {
    console.log('[Scraper] Starting scheduled job scrape...');

    const results = await Promise.allSettled([
      scrapeDGR(),
      scrapeKSB(),
      scrapePIB(),
      scrapeDESW(),
      scrapeAWPO(),
    ]);

    let allJobs = [];
    results.forEach((result, i) => {
      const names = ['DGR', 'KSB', 'PIB', 'DESW', 'AWPO'];
      if (result.status === 'fulfilled') {
        console.log(`[Scraper] ${names[i]}: ${result.value.length} jobs`);
        allJobs = allJobs.concat(result.value);
      } else {
        console.error(`[Scraper] ${names[i]} failed:`, result.reason);
      }
    });

    // Deduplicate by id
    const seen = new Set();
    const unique = allJobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });

    const written = await writeJobsToFirestore(unique);
    console.log(`[Scraper] Done. Wrote ${written} jobs to Firestore.`);

    // Update last-scraped metadata
    await db.collection('meta').doc('scraper').set({
      lastRun: admin.firestore.FieldValue.serverTimestamp(),
      jobsFound: unique.length,
      jobsWritten: written,
    });
  });

// ─────────────────────────────────────────────────────────
// FUNCTION 2: Seed Firestore with curated past listings
// Call once via: firebase functions:shell → seedJobs({})
// Or deploy and hit the HTTP URL once
// ─────────────────────────────────────────────────────────
exports.seedJobs = functions.https.onRequest(async (req, res) => {
  // Basic auth guard — only allow with secret key
  const key = req.query.key || req.body?.key;
  const SECRET = functions.config().scraper?.secret || 'esm-seed-2026';
  if (key !== SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const seedWithMeta = SEED_JOBS.map((job) => ({
      ...job,
      source: job.source || 'SEED',
      scrapedAt: new Date().toISOString(),
    }));

    const written = await writeJobsToFirestore(seedWithMeta);
    console.log(`[Seed] Wrote ${written} seed jobs`);
    return res.json({ success: true, written });
  } catch (err) {
    console.error('[Seed] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// FUNCTION 3: Manual trigger (for dev/testing)
// ─────────────────────────────────────────────────────────
exports.manualScrape = functions
  .runWith({ timeoutSeconds: 300, memory: '512MB' })
  .https.onRequest(async (req, res) => {
    const key = req.query.key || req.body?.key;
    const SECRET = functions.config().scraper?.secret || 'esm-seed-2026';
    if (key !== SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('[ManualScrape] Starting...');
    const results = await Promise.allSettled([
      scrapeDGR(),
      scrapeKSB(),
      scrapePIB(),
      scrapeDESW(),
      scrapeAWPO(),
    ]);

    let allJobs = [];
    const stats = {};
    const names = ['DGR', 'KSB', 'PIB', 'DESW', 'AWPO'];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        stats[names[i]] = result.value.length;
        allJobs = allJobs.concat(result.value);
      } else {
        stats[names[i]] = `ERROR: ${result.reason?.message}`;
      }
    });

    const seen = new Set();
    const unique = allJobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });

    const written = await writeJobsToFirestore(unique);

    return res.json({
      success: true,
      stats,
      totalUnique: unique.length,
      written,
    });
  });

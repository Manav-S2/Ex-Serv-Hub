/**
 * ESM Hub — Job Service
 * Provides client-side access to scraped & employer-posted jobs.
 * Integrates directly with Cloud Firestore when configured,
 * with seamless offline fallback to curated seed jobs.
 */

import { db, auth, isFirebaseConfigured } from '../config/firebase.js';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

// Load initial seed dataset
let localJobs = [];
try {
  localJobs = require('../../functions/seed_jobs.json');
} catch {
  localJobs = [];
}

// In-memory cache for fast UI updates & offline fallback
let customJobs = [];
let firestoreCache = [];
let bookmarkedJobIds = new Set();

/**
 * Fetch all available jobs with optional filtering.
 * Tries Firestore first; falls back to local seed data if offline or not configured.
 *
 * @param {Object} filters
 * @param {string} [filters.query] - Search term
 * @param {string} [filters.category] - Sector category (All, DGR, KSB, AWPO, Security, etc.)
 * @param {string} [filters.rank] - 'All' | 'Officer' | 'JCO' | 'OR / Jawan'
 * @param {string} [filters.state] - State or 'All'
 * @param {string} [filters.status] - 'all' | 'active' | 'closing-soon' | 'closed'
 */
export async function getJobs(filters = {}) {
  let sourceJobs = [];

  if (isFirebaseConfigured && db) {
    try {
      if (firestoreCache.length === 0) {
        const q = query(collection(db, 'jobs'), limit(200));
        const snapshot = await getDocs(q);
        const fetched = [];
        snapshot.forEach(docSnap => {
          fetched.push({ id: docSnap.id, ...docSnap.data() });
        });

        // If Firestore is still empty, auto-seed with local jobs
        if (fetched.length === 0 && localJobs.length > 0) {
          console.log('[JobService] Firestore jobs collection is empty. Auto-seeding initial jobs...');
          void seedFirestoreWithInitialJobs();
          sourceJobs = [...customJobs, ...localJobs];
        } else {
          firestoreCache = fetched;
          sourceJobs = [...customJobs, ...firestoreCache];
        }
      } else {
        sourceJobs = [...customJobs, ...firestoreCache];
      }
    } catch (err) {
      console.warn('[JobService] Error querying Firestore, falling back to local dataset:', err.message);
      sourceJobs = [...customJobs, ...localJobs];
    }
  } else {
    sourceJobs = [...customJobs, ...localJobs];
  }

  // Deduplicate by ID
  const seenIds = new Set();
  const uniqueJobs = sourceJobs.filter(j => {
    if (seenIds.has(j.id)) return false;
    seenIds.add(j.id);
    return true;
  });

  return uniqueJobs.filter(job => {
    // 1. Text Search Filter
    if (filters.query && filters.query.trim()) {
      const qText = filters.query.toLowerCase().trim();
      const matchTitle = job.title?.toLowerCase().includes(qText);
      const matchOrg = job.org?.toLowerCase().includes(qText);
      const matchDesc = job.description?.toLowerCase().includes(qText);
      const matchState = job.state?.toLowerCase().includes(qText);
      const matchTags = Array.isArray(job.tags) && job.tags.some(t => t.toLowerCase().includes(qText));
      if (!matchTitle && !matchOrg && !matchDesc && !matchState && !matchTags) {
        return false;
      }
    }

    // 2. Category / Sector Filter
    if (filters.category && filters.category !== 'All') {
      const cat = filters.category.toLowerCase();
      const jobCat = (job.category || '').toLowerCase();
      const jobOrg = (job.org || '').toLowerCase();
      if (!jobCat.includes(cat) && !jobOrg.includes(cat)) {
        return false;
      }
    }

    // 3. Rank Eligibility Filter
    if (filters.rank && filters.rank !== 'All') {
      const rankFilter = filters.rank.toLowerCase();
      const elig = (job.eligibility || '').toLowerCase();
      const title = (job.title || '').toLowerCase();
      const combinedText = `${elig} ${title}`;

      if (rankFilter.includes('officer') && !combinedText.includes('officer') && !combinedText.includes('all rank')) {
        return false;
      }
      if (rankFilter.includes('jco') && !combinedText.includes('jco') && !combinedText.includes('all rank')) {
        return false;
      }
      if (rankFilter.includes('or') && !combinedText.includes('or') && !combinedText.includes('jawan') && !combinedText.includes('all rank')) {
        return false;
      }
    }

    // 4. State Filter
    if (filters.state && filters.state !== 'All') {
      const s = filters.state.toLowerCase();
      const jobState = (job.state || '').toLowerCase();
      if (jobState !== 'pan india' && !jobState.includes(s)) {
        return false;
      }
    }

    // 5. Status Filter
    if (filters.status && filters.status !== 'all') {
      if (job.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Submit a new job posting (Employer or Admin tool)
 * Writes to Firestore if connected, and caches locally.
 *
 * @param {Object} jobData
 */
export async function postJob(jobData) {
  const newId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newJob = {
    id: newId,
    title: jobData.title || 'Untitled Vacancy',
    org: jobData.org || 'Verified Employer',
    category: jobData.category || 'Private / Corporate',
    description: jobData.description || '',
    state: jobData.state || 'Pan India',
    eligibility: jobData.eligibility || 'Ex-Servicemen',
    postedDate: new Date().toISOString().split('T')[0],
    closingDate: jobData.closingDate || '',
    eventDate: jobData.eventDate || null,
    status: 'active',
    source: 'Employer Portal',
    sourceUrl: jobData.sourceUrl || '',
    vacancies: jobData.vacancies ? parseInt(jobData.vacancies, 10) : null,
    contactEmail: jobData.contactEmail || '',
    contactPhone: jobData.contactPhone || '',
    tags: jobData.tags || ['Verified Employer', 'Direct Hiring'],
    createdAt: new Date().toISOString(),
  };

  customJobs.unshift(newJob);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'jobs', newId), {
        ...newJob,
        serverCreatedAt: serverTimestamp(),
      });
      console.log('[JobService] Job successfully written to Firestore:', newId);
    } catch (err) {
      console.error('[JobService] Failed to write job to Firestore:', err);
    }
  }

  return newJob;
}

/**
 * Toggle bookmark for a job.
 * If user is logged in, syncs to Firestore under `users/{uid}/bookmarks/{jobId}`.
 */
export async function toggleBookmark(jobId) {
  const isCurrentlyBookmarked = bookmarkedJobIds.has(jobId);

  if (isCurrentlyBookmarked) {
    bookmarkedJobIds.delete(jobId);
  } else {
    bookmarkedJobIds.add(jobId);
  }

  const currentUser = auth?.currentUser;
  if (isFirebaseConfigured && db && currentUser) {
    try {
      const bookmarkRef = doc(db, 'users', currentUser.uid, 'bookmarks', jobId);
      if (isCurrentlyBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          jobId,
          savedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('[JobService] Bookmark cloud sync error:', err.message);
    }
  }

  return !isCurrentlyBookmarked;
}

/**
 * Check if job is bookmarked
 */
export function isBookmarked(jobId) {
  return bookmarkedJobIds.has(jobId);
}

/**
 * Get all bookmarked jobs
 */
export async function getBookmarkedJobs() {
  const all = [...customJobs, ...firestoreCache, ...localJobs];
  const seen = new Set();
  return all.filter(j => {
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return bookmarkedJobIds.has(j.id);
  });
}

/**
 * Helper: Seeds Firestore with curated seed jobs on first launch
 */
export async function seedFirestoreWithInitialJobs() {
  if (!isFirebaseConfigured || !db || localJobs.length === 0) return 0;

  try {
    const batch = writeBatch(db);
    let count = 0;

    localJobs.forEach(job => {
      if (!job.id) return;
      const ref = doc(db, 'jobs', job.id);
      batch.set(ref, {
        ...job,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      count++;
    });

    await batch.commit();
    console.log(`[JobService] Successfully seeded ${count} initial jobs into Firestore.`);
    firestoreCache = [...localJobs];
    return count;
  } catch (err) {
    console.error('[JobService] Error seeding Firestore:', err);
    return 0;
  }
}

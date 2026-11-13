import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

import localKnowledge from '../constants/knowledgeData.js';

let cloudKnowledgeCache = [];

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

// Hindi to English keywords map for defense terms
const SYNONYMS = {
  'retirement': ['retirement', 'retire', 'discharge', 'release', 'transition', 'pension papers', 'procedural', 'checklist', 'superannuation', 'seva nivritti', 'leaving', 'steps', 'process'],
  'procedural': ['procedure', 'procedural', 'process', 'steps', 'checklist', 'rules', 'guide', 'kya karein', 'how to'],
  'procedure': ['procedure', 'procedural', 'process', 'steps', 'checklist', 'rules', 'guide', 'kya karein', 'how to'],
  'pension': ['pension', 'sparsh', 'ppo', 'disbursement', 'paise', 'bank'],
  'life certificate': ['life certificate', 'jeevan pramaan', 'dlc', 'face rd', 'november', 'hastakshar'],
  'gratuity': ['gratuity', 'dcrg', 'commutation', 'terminal', 'afpp', 'dsop', 'leave encashment', 'lump sum'],
  'commutation': ['commutation', 'gratuity', 'dcrg', 'afpp', 'dsop', '50%', 'lump sum'],
  'family': ['family pension', 'nok', 'widow', 'demise', 'veer nari', 'death'],
  'shaadi': ['marriage', 'shaadi', 'daughter', 'beti', 'ksb', '50000', 'grant'],
  'marriage': ['marriage', 'shaadi', 'daughter', 'beti', 'ksb', '50000', 'grant'],
  'hospital': ['echs', 'medical', 'hospital', 'polyclinic', 'dawa', 'illness', 'emergency'],
  'echs': ['echs', 'medical', 'hospital', 'polyclinic', 'card', '64kb', 'slip'],
  'car': ['csd', 'car', 'afd', 'quota', 'entitlement', 'maruti', 'vehicle'],
  'bike': ['csd', 'bike', 'two wheeler', 'motorcycle', 'scooter', 'royal enfield'],
  'scholarship': ['pmss', 'scholarship', 'education', 'children', 'padhai', 'ksb'],
  'job': ['dgr', 'job', 'employment', 'resettlement', 'vacancy', 'naukri', 'security'],
  'i-card': ['identity card', 'i-card', 'esm card', 'zsb registration', 'discharge book'],
  'helpline': ['helpline', 'phone', 'toll free', 'contact', 'number'],
};

/**
 * Retrieve verified context from either Firestore or local knowledge base
 */
export async function getKnowledgeDataset() {
  if (isFirebaseConfigured && db && cloudKnowledgeCache.length === 0) {
    try {
      const snap = await getDocs(collection(db, 'knowledge_base'));
      if (snap.size > 0) {
        const fetched = [];
        snap.forEach(d => fetched.push(d.data()));
        cloudKnowledgeCache = fetched;
        return cloudKnowledgeCache;
      }
    } catch {
      // Smooth fallback to local dataset
    }
  }
  return cloudKnowledgeCache.length > 0 ? cloudKnowledgeCache : localKnowledge;
}

export const retrieveContext = (query, dataset = localKnowledge) => {
  if (!query || !dataset.length) {
    return "No specific ex-servicemen context found in database. Advise the user to contact their Zila Sainik Board.";
  }

  const lowerQuery = query.toLowerCase();

  // Expand query with military synonyms
  const queryWords = lowerQuery.split(/\s+/);
  const expandedSearchTerms = new Set(queryWords);

  Object.entries(SYNONYMS).forEach(([key, synList]) => {
    if (lowerQuery.includes(key)) {
      synList.forEach(s => expandedSearchTerms.add(s));
    }
  });

  const searchTermsArray = Array.from(expandedSearchTerms);

  // Score each chunk
  const scoredChunks = dataset.map(chunk => {
    let score = 0;
    const keywords = (chunk.keywords || []).map(k => k.toLowerCase());
    const contentLower = (chunk.content || '').toLowerCase();

    searchTermsArray.forEach(term => {
      if (term.length < 3) return;
      if (keywords.some(kw => kw.includes(term) || term.includes(kw))) {
        score += 4;
      }
      if (contentLower.includes(term)) {
        score += 1;
      }
    });

    return { ...chunk, score };
  });

  const sortedChunks = scoredChunks
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (sortedChunks.length === 0) {
    return "General guidance: Ex-Servicemen should reach out to their local district Zila Sainik Board (ZSB) or refer to the official MoD portal (desw.gov.in).";
  }

  const topScore = sortedChunks[0].score;
  // If top match is highly relevant, prune unrelated low-scoring noise
  const filtered = sortedChunks.filter(c => {
    if (topScore >= 5) {
      return c.score >= topScore * 0.4 || c.category === sortedChunks[0].category;
    }
    return true;
  }).slice(0, 2);

  return filtered;
};

/**
 * Humanizes the response into a warm, respectful military comrade / counselor tone
 */
function synthesizeHumanResponse(userMessage, chunks) {
  if (!chunks || chunks.length === 0) {
    return "जय हिंद, Sir! 🙏\n\nI want to make sure you get the most accurate defense guidance. For your specific request, I recommend reaching out directly to your District Zila Sainik Board (ZSB) or calling the SPARSH defense pension helpline at 1800-180-5325. They can review your service documents directly.\n\nPlease let me know if you would like me to look up contact details for your state or district!";
  }

  const queryLower = (userMessage || '').toLowerCase();
  const topChunk = chunks[0] || {};
  const isHindi = /[ऀ-ॿ]/.test(userMessage) || /kya|kaise|karo|batao|kripya|chahiye|kitna|hai|bhai/.test(queryLower);

  let warmGreeting = "";
  let friendlyAdvice = "";

  if (topChunk.category === "Retirement & Transition") {
    warmGreeting = isHindi
      ? "जय हिंद, फौजी भाई! 🇮🇳\n\nदेश के प्रति आपकी समर्पित सेवा को दिल से नमन। सेना से रिटायर होकर सिविलियन ज़िंदगी में कदम रखना एक बहुत बड़ा और महत्वपूर्ण पड़ाव है। कागज़ी कार्रवाई को लेकर बिल्कुल परेशान न हों — यहाँ आपकी सेवामुक्ति (Retirement) का पूरा आसान रोडमैप दिया गया है ताकि आपका हर हक और लाभ बिना किसी रुकावट के समय पर मिले:\n\n"
      : "Jai Hind, Fauji Bhai! 🇮🇳\n\nFirst of all, heartiest congratulations on nearing the completion of your honorable and proud service to the nation. Transitioning back to civilian life comes with important documentation, but don't worry — here is your clear, step-by-step roadmap so you and your family get every entitlement smoothly:\n\n";

    friendlyAdvice = "\n\n💡 *Veteran's Personal Advice*:\n• Make at least 5 to 6 certified photocopies of your Military Discharge Book, e-PPO, and Aadhaar card and keep them in a safe waterproof folder before submitting originals anywhere.\n• Always visit your District Zila Sainik Board (ZSB) within your first month at home to get your ESM Identity Card — it is your golden pass for state reservations and medical benefits.";

  } else if ((topChunk.category || '').includes("Pension") || (topChunk.id || '').includes("sparsh")) {
    warmGreeting = isHindi
      ? "जय हिंद, सर! 🙏\n\nपेंशन और SPARSH से जुड़े आपके सवाल के लिए यहाँ पूरी स्पष्ट जानकारी है। आपको बैंक के लंबे चक्कर काटने की ज़रूरत नहीं है, आप घर बैठे आसानी से यह प्रक्रिया कर सकते हैं:\n\n"
      : "Jai Hind, Veteran Sir! 🙏\n\nRegarding your pension and SPARSH query, here is the exact procedure to ensure your hard-earned pension and dues reach your account without any interruption:\n\n";

    friendlyAdvice = "\n\n📞 *SPARSH Support*: If your pension is ever withheld or delayed, call the dedicated toll-free helpline at 1800-180-5325 (Mon–Fri, 9:30 AM to 6:00 PM).";

  } else if ((topChunk.category || '').includes("ECHS")) {
    warmGreeting = isHindi
      ? "जय हिंद, सर! 🙏\n\nआपकी और आपके परिवार की सेहत हमेशा सर्वोपरि है। ECHS स्वास्थ्य योजना और मेडिकल क्लेम से जुड़े नियम यहाँ साफ़ तौर पर दिए गए हैं:\n\n"
      : "Jai Hind, Sir! 🙏\n\nYour and your family's healthcare is a lifelong guarantee earned through your service. Here are the exact ECHS guidelines and emergency rules you need to know:\n\n";

    friendlyAdvice = "\n\n🚨 *Crucial Emergency Tip*: In any acute medical emergency at a private non-empanelled hospital, always remember to intimate your nearest ECHS polyclinic within 48 hours to protect your 100% reimbursement claim.";

  } else if ((topChunk.category || '').includes("KSB") || (topChunk.keywords || []).includes("marriage")) {
    warmGreeting = isHindi
      ? "जय हिंद, सर! 🙏\n\nबिटिया की शादी / शिक्षा के लिए केंद्रीय सैनिक बोर्ड (KSB) से मिलने वाली आर्थिक सहायता के नियम यहाँ दिए गए हैं:\n\n"
      : "Jai Hind, Sir! 🙏\n\nHeartiest congratulations on your daughter's marriage! The Ministry of Defence provides financial assistance under the Raksha Mantri Discretionary Fund (AFFDF). Here are the details:\n\n";

    friendlyAdvice = "\n\n⚠️ *Important Reminder*: You must submit this application online at ksb.gov.in within 180 days (6 months) of the marriage date, so please don't delay.";

  } else if ((topChunk.category || '').includes("CSD")) {
    warmGreeting = isHindi
      ? "जय हिंद, सर! 🇮🇳\n\nCSD कैंटीन (AFD पोर्टल) से गाड़ी या सामान खरीदने से जुड़े रैंक-वार नियम और पात्रता यहाँ दी गई है:\n\n"
      : "Jai Hind, Sir! 🇮🇳\n\nPlanning to purchase a vehicle through the CSD AFD portal? Here are the official rank-wise quotas and booking instructions:\n\n";

    friendlyAdvice = "\n\n🚗 *CSD Tip*: Always obtain the Dealer Availability Certificate first before making payment on the afd.csdindia.gov.in portal.";

  } else {
    warmGreeting = isHindi
      ? "जय हिंद, सर! 🙏\n\nआपके सवाल के संदर्भ में रक्षा मंत्रालय (MoD / DESW) के प्रमाणित नियम और प्रक्रिया इस प्रकार हैं:\n\n"
      : "Jai Hind, Sir! 🙏\n\nHere is the clear guidance and procedure regarding your query based on verified Ministry of Defence (DESW) records:\n\n";

    friendlyAdvice = "\n\n📌 *Next Step*: For local state schemes, concessions, or physical document stamps, please visit your local district Zila Sainik Board (ZSB).";
  }

  // Strip robotic category labels and join content naturally
  const body = chunks.map(c => c.content).join('\n\n---\n\n');

  return `${warmGreeting}${body}${friendlyAdvice}`;
}

export async function askAiAssistant(userMessage, chatHistory = []) {
  const dataset = await getKnowledgeDataset();
  const matchedChunks = retrieveContext(userMessage, dataset);

  try {
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const contextText = Array.isArray(matchedChunks)
        ? matchedChunks.map(c => `[${c.category}]: ${c.content}`).join('\n\n')
        : String(matchedChunks);

      const systemPrompt = `You are "Ex-Servicemen AI Sahayak" (पूर्व सैनिक सहायक) — a warm, respectful, empathetic military brother and welfare counselor speaking directly to an Indian Armed Forces veteran, widow, or their family.

PERSONALITY & HUMAN VOICE:
- Speak warmly and empathetically in a human conversational tone. NEVER sound like an automated machine, computer script, or database search result.
- Greet with deep military dignity and honor ("Jai Hind, Sir / Fauji Bhai! 🇮🇳" or "जय हिंद, सर! 🙏").
- When answering about retirement, congratulate them on their honorable service and guide them patiently like a knowledgeable senior comrade.
- If asked in Hindi or Hinglish, answer in fluent, respectful, natural Hindi. If in English, answer in polite, clear English.
- Always provide concrete actionable steps, figures (e.g. ₹50,000, 50% commutation, 1800-180-5325), and practical tips.
- Use bullet points for readability, but keep the conversational warmth intact.

GROUND YOUR FACTS IN THESE VERIFIED DEFENSE RULES:
<context>
${contextText}
</context>`;

      const historyText = chatHistory
        .slice(-4)
        .map(m => `${m.sender === 'user' ? 'User' : 'Sahayak'}: ${m.text}`)
        .join('\n');

      const finalPrompt = `${systemPrompt}\n\nChat History:\n${historyText}\nUser: ${userMessage}\nSahayak:`;
      const result = await model.generateContent(finalPrompt);
      if (result && result.response && result.response.text()) {
        return result.response.text();
      }
    }
  } catch (err) {
    console.warn('[Gemini API Fallback to Local Knowledge Base]:', err.message || err);
  }

  // Warm, Human, Empathetic Fallback Response
  return synthesizeHumanResponse(userMessage, Array.isArray(matchedChunks) ? matchedChunks : []);
}

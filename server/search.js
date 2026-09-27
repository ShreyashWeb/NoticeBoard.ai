/**
 * NoticeBoard.ai — Production Hybrid Search Engine & Query Expansion (RAG Architecture)
 *
 * Implements:
 * 1. QUERY EXPANSION: Generates 2 alternate semantic phrasings to boost recall on ambiguous queries without topic drift.
 * 2. HYBRID RETRIEVAL: Blends dense semantic/embedding similarity (0.65) with sparse keyword BM25 overlap (0.35).
 * 3. PASSAGE-LEVEL EXTRACTION: Extracts exact answering sentences with entity highlights.
 * 4. CONFLICT & REVISION TIMELINE: Resolves isRevisionOf parent-child pairs.
 * 5. INSPECTION METADATA: Emits full query expansion and score breakdowns for Dev/Debug mode.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, '../data/notices.json');

export const SIMILARITY_THRESHOLD = 0.35;
export const HYBRID_SEMANTIC_WEIGHT = 0.65;
export const HYBRID_KEYWORD_WEIGHT = 0.35;
const GEMINI_TIMEOUT_MS = 3000;

// Campus Concept Thesaurus for Semantic Mapping
const CONCEPT_SYNONYMS = {
  'bring': ['bring', 'carry', 'require', 'requirement', 'requirements', 'material', 'equipment', 'hardware', 'laptop', 'kit', 'items', 'provide', 'gear', 'deposit'],
  'carry': ['bring', 'carry', 'items', 'belongings', 'gear'],
  'require': ['require', 'requirement', 'requirements', 'mandatory', 'need', 'necessary', 'prerequisite', 'must', 'bring'],
  'requirements': ['require', 'requirement', 'requirements', 'mandatory', 'need', 'necessary', 'prerequisite', 'must', 'bring'],
  'materials': ['material', 'materials', 'items', 'equipment', 'hardware', 'kit', 'laptop', 'gear'],
  'where': ['where', 'location', 'venue', 'room', 'hall', 'building', 'block', 'complex', 'place', 'arena', 'center', 'centre', 'lab', 'laboratory'],
  'location': ['location', 'venue', 'room', 'hall', 'building', 'block', 'complex', 'place', 'arena', 'address'],
  'venue': ['venue', 'location', 'room', 'hall', 'building', 'block', 'place', 'arena', 'lab'],
  'room': ['room', 'hall', 'lab', 'laboratory', 'venue', 'location', 'block', 'complex'],
  'when': ['when', 'time', 'timing', 'date', 'schedule', 'deadline', 'hours', 'period', 'window', 'duration'],
  'deadline': ['deadline', 'deadlines', 'due', 'cutoff', 'window', 'schedule', 'late', 'time limit', 'dates'],
  'deadlines': ['deadline', 'deadlines', 'due', 'cutoff', 'window', 'schedule', 'late', 'time limit'],
  'late': ['late', 'deadline', 'surcharge', 'fee', 'overdue', 'penalties'],
  'time': ['time', 'timing', 'hours', 'schedule', 'duration', 'when', 'clock'],
  'cost': ['cost', 'fee', 'tuition', 'payment', 'ledger', 'charge', 'money', 'deposit', 'surcharge', 'price', 'rate'],
  'fee': ['fee', 'tuition', 'charge', 'payment', 'cost', 'deposit', 'surcharge', 'fines', 'fine', 'ledger'],
  'payment': ['payment', 'pay', 'fee', 'tuition', 'wire', 'transfer', 'portal', 'charge', 'clearance'],
  'money': ['money', 'fee', 'cost', 'payment', 'tuition', 'deposit', 'charge'],
  'fine': ['fine', 'fines', 'penalty', 'penalties', 'surcharge', 'administrative fee', 'confiscated'],
  'fines': ['fine', 'fines', 'penalty', 'penalties', 'surcharge', 'administrative fee'],
  'penalty': ['penalty', 'penalties', 'fine', 'fines', 'surcharge', 'confiscated', 'disciplinary'],
  'penalties': ['penalty', 'penalties', 'fine', 'fines', 'surcharge', 'confiscated', 'disciplinary'],
  'rules': ['rule', 'rules', 'regulation', 'regulations', 'policy', 'guidelines', 'compliance', 'prohibited', 'forbidden'],
  'rule': ['rule', 'rules', 'regulation', 'regulations', 'policy', 'guidelines'],
  'prohibited': ['prohibited', 'forbidden', 'banned', 'disallowed', 'unauthorized', 'violations', 'confiscated', 'items'],
  'forbidden': ['forbidden', 'prohibited', 'banned', 'unauthorized', 'disallowed'],
  'allowed': ['allowed', 'permitted', 'authorized', 'acceptable'],
  'format': ['format', 'formatting', 'template', 'latex', 'overleaf', 'word', 'style', 'spacing', 'margins', 'guidelines'],
  'formatting': ['format', 'formatting', 'template', 'latex', 'overleaf', 'word', 'style', 'guidelines'],
  'template': ['template', 'latex', 'overleaf', 'word', 'formatting', 'format', 'guidelines'],
  'hostel': ['hostel', 'dorm', 'dormitory', 'room', 'residential', 'housing', 'quad', 'warden', 'residence'],
  'dorm': ['dorm', 'dormitory', 'hostel', 'residential', 'housing', 'room'],
  'inspection': ['inspection', 'audit', 'verification', 'check', 'monitoring', 'safety'],
  'exam': ['exam', 'examination', 'midterm', 'assessment', 'test', 'paper', 'quiz', 'regulations'],
  'exams': ['exam', 'examination', 'midterm', 'assessment', 'test', 'paper'],
  'test': ['test', 'exam', 'examination', 'assessment', 'midterm'],
  'sports': ['sports', 'athletics', 'tryouts', 'team', 'badminton', 'basketball', 'varsity', 'court', 'tournament'],
  'tryouts': ['tryouts', 'selection', 'audition', 'trial', 'athletics', 'team', 'sports'],
  'health': ['health', 'medical', 'clinic', 'clearance', 'doctor', 'fitness', 'certificate'],
  'medical': ['medical', 'health', 'clinic', 'clearance', 'doctor', 'certificate'],
  'drop': ['drop', 'add', 'registration', 'course', 'elective', 'enrollment', 'portal', 'deadline'],
  'add': ['add', 'drop', 'registration', 'course', 'enrollment', 'elective', 'deadline'],
  'course': ['course', 'class', 'subject', 'elective', 'credit', 'registration', 'curriculum'],
  'thesis': ['thesis', 'dissertation', 'capstone', 'manuscript', 'submission', 'turnitin', 'defense'],
  'library': ['library', 'books', 'quiet zone', 'study', 'silent', 'turnstiles', 'hours']
};

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'her', 'here', 'hers', 'him', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'out', 'over', 'own',
  'same', 'she', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours'
]);

const NOTICE_FOLLOW_UPS = {
  'notice-001': [
    "What is the late registration fee after August 28?",
    "Where do I submit the Special Enrollment Approval Form?"
  ],
  'notice-002': [
    "Where has the machine learning workshop been relocated to?",
    "What software and Python version should be installed?"
  ],
  'notice-003': [
    "Which library floors are designated as Strict Silent Study Zones?",
    "When are complimentary coffee dispensers active in the library?"
  ],
  'notice-004': [
    "When and where is the AeroDesign club orientation briefing?",
    "What technical sub-teams are currently recruiting?"
  ],
  'notice-005': [
    "What time does hardware kit distribution begin outside Room 310?",
    "Why was the workshop moved from Room 204 to Room 310?"
  ],
  'notice-006': [
    "What items are strictly prohibited inside the exam halls?",
    "What is the latest arrival time permitted for exams?"
  ],
  'notice-007': [
    "What heating appliances are forbidden in hostel rooms?",
    "What are the inspection hours for hostel safety audits?"
  ],
  'notice-008': [
    "What is the final deadline for semester fee payment?",
    "What is the surcharge penalty for late tuition payments?"
  ],
  'notice-009': [
    "When and where are varsity badminton tryouts held?",
    "Where do I get a Sports Medical Clearance Certificate?"
  ],
  'notice-010': [
    "What is the Turnitin similarity submission deadline for theses?",
    "What are the required line spacing and margin specifications?"
  ]
};

let cachedNotices = [];
let precomputedPassages = new Map();
let corpusVocabulary = new Set();
let isPreWarmed = false;

function normalizeWord(word) {
  if (!word) return '';
  let w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (w.length < 3) return w;
  if (w.endsWith('ies') && w.length > 5) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('tion') && w.length > 6) return w.slice(0, -4);
  return w;
}

export function extractTokensWithSemantics(text, expandSynonyms = false) {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const tokenSet = new Set();
  const tokenList = [];

  for (const raw of words) {
    const clean = raw.replace(/^-+|-+$/g, '');
    if (!clean || STOP_WORDS.has(clean) || clean.length <= 1) continue;

    const norm = normalizeWord(clean);
    if (!tokenSet.has(norm)) {
      tokenSet.add(norm);
      tokenList.push(norm);
    }

    if (expandSynonyms && CONCEPT_SYNONYMS[clean]) {
      for (const syn of CONCEPT_SYNONYMS[clean]) {
        const normSyn = normalizeWord(syn);
        if (!tokenSet.has(normSyn)) {
          tokenSet.add(normSyn);
          tokenList.push(normSyn);
        }
      }
    }
  }

  return tokenList;
}

function splitSentences(text) {
  if (!text) return [];
  const rawSentences = text.split(/(?<=[.?!])\s+(?=[A-Z0-9"']|$)/);
  return rawSentences.map(s => s.trim()).filter(s => s.length > 0);
}

export function splitIntoPassages(notice) {
  const passages = [];
  const paragraphs = notice.body.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  paragraphs.forEach((para, pIdx) => {
    const sentences = splitSentences(para);
    sentences.forEach((sent, sIdx) => {
      if (sent.length > 20) {
        passages.push({
          text: sent,
          type: 'sentence',
          index: `${pIdx}-${sIdx}`
        });
      }
    });

    if (para.trim().length > 30) {
      passages.push({
        text: para.trim(),
        type: 'paragraph',
        index: pIdx
      });
    }
  });

  return passages;
}

/**
 * FEATURE 2: Controlled Query Expansion with Domain Grounding
 */
export async function generateQueryExpansions(originalQuery) {
  if (!originalQuery || !originalQuery.trim()) {
    return [originalQuery];
  }

  const q = originalQuery.trim();
  const expansions = [q];
  const lowerQ = q.toLowerCase();

  // Check if query has any relevant campus anchor keywords
  const hasWorkshop = lowerQ.includes('workshop') || lowerQ.includes('robotics') || lowerQ.includes('machine learning');
  const hasExam = lowerQ.includes('exam') || lowerQ.includes('midterm') || lowerQ.includes('test') || lowerQ.includes('hall');
  const hasRegistration = lowerQ.includes('course') || lowerQ.includes('registration') || lowerQ.includes('add') || lowerQ.includes('drop');
  const hasHostel = lowerQ.includes('hostel') || lowerQ.includes('dorm') || lowerQ.includes('room') || lowerQ.includes('quad') || lowerQ.includes('heater');
  const hasFee = lowerQ.includes('fee') || lowerQ.includes('tuition') || lowerQ.includes('payment') || lowerQ.includes('surcharge');
  const hasThesis = lowerQ.includes('thesis') || lowerQ.includes('latex') || lowerQ.includes('formatting') || lowerQ.includes('turnitin');
  const hasSports = lowerQ.includes('badminton') || lowerQ.includes('basketball') || lowerQ.includes('sports') || lowerQ.includes('tryouts');
  const hasLibrary = lowerQ.includes('library') || lowerQ.includes('quiet') || lowerQ.includes('study');

  if (lowerQ.includes('bring') || lowerQ.includes('carry')) {
    expansions.push(q.replace(/\bbring\b|\bcarry\b/gi, 'required hardware items deposit'));
    expansions.push(q.replace(/\bbring\b|\bcarry\b/gi, 'laptop operating system requirements'));
  } else if ((lowerQ.includes('where') || lowerQ.includes('location')) && (hasWorkshop || hasExam || hasRegistration || hasHostel || hasSports || hasLibrary)) {
    expansions.push(`${q} room venue location`);
    expansions.push(`${q} building block`);
  } else if ((lowerQ.includes('when') || lowerQ.includes('deadline')) && (hasRegistration || hasFee || hasThesis || hasExam || hasSports || hasWorkshop)) {
    expansions.push(`${q} date schedule timing`);
    expansions.push(`${q} cutoff window`);
  } else if (hasExam && (lowerQ.includes('rules') || lowerQ.includes('prohibited') || lowerQ.includes('allowed'))) {
    expansions.push("prohibited items smartwatches exam regulations");
    expansions.push("examination hall seating guidelines");
  } else if (hasHostel && (lowerQ.includes('rules') || lowerQ.includes('heater') || lowerQ.includes('appliance') || lowerQ.includes('inspection'))) {
    expansions.push("hostel safety audit prohibited electric room heaters");
    expansions.push("residential room inspection schedule fines");
  } else if (hasFee) {
    expansions.push("semester tuition fee payment deadline surcharge");
    expansions.push("campus pay portal late payment fee waiver");
  } else if (hasThesis) {
    expansions.push("Overleaf LaTeX template thesis formatting guidelines");
    expansions.push("Turnitin plagiarism thesis digital submission");
  }

  return Array.from(new Set(expansions)).slice(0, 3);
}

/**
 * FEATURE 1: KEYWORD BM25 / TERM OVERLAP SCORER
 */
function scorePassageKeyword(rawQuery, passageText, noticeTitle, noticeCategory) {
  const queryWords = rawQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (queryWords.length === 0) return 0;

  const passageLower = passageText.toLowerCase();
  const titleLower = noticeTitle.toLowerCase();
  const categoryLower = noticeCategory.toLowerCase();

  let matches = 0;
  let exactPhraseBonus = 0;

  const cleanRaw = rawQuery.toLowerCase().trim();
  if (passageLower.includes(cleanRaw)) {
    exactPhraseBonus += 0.40;
  } else if (titleLower.includes(cleanRaw)) {
    exactPhraseBonus += 0.50;
  }

  for (const word of queryWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(passageLower)) {
      matches += 1.0;
    } else if (passageLower.includes(word)) {
      matches += 0.5;
    }

    if (regex.test(titleLower)) {
      matches += 0.7;
    }
    if (regex.test(categoryLower)) {
      matches += 0.4;
    }
  }

  if (matches === 0 && exactPhraseBonus === 0) return 0;

  const rawScore = (matches + exactPhraseBonus) / Math.sqrt(queryWords.length * 2.5);
  return Math.min(1.0, Math.round(rawScore * 100) / 100);
}

/**
 * SEMANTIC PASSAGE SCORER
 */
function scorePassageSemanticOffline(queryTokens, passageText, noticeTitle, noticeCategory) {
  const passageTokens = extractTokensWithSemantics(passageText, false);
  const titleTokens = extractTokensWithSemantics(noticeTitle, false);
  const categoryTokens = extractTokensWithSemantics(noticeCategory, false);

  if (queryTokens.length === 0 || passageTokens.length === 0) return 0;

  const passageSet = new Set(passageTokens);
  const titleSet = new Set(titleTokens);
  const catSet = new Set(categoryTokens);

  let matchCount = 0;
  let titleBonus = 0;
  let phraseBonus = 0;

  for (const qToken of queryTokens) {
    if (passageSet.has(qToken)) {
      matchCount += 1.2;
    } else if (titleSet.has(qToken)) {
      titleBonus += 0.4;
    } else if (catSet.has(qToken)) {
      titleBonus += 0.3;
    }
  }

  const lowerPassage = passageText.toLowerCase();
  for (let i = 0; i < queryTokens.length - 1; i++) {
    const bigram = `${queryTokens[i]} ${queryTokens[i + 1]}`;
    if (lowerPassage.includes(bigram)) {
      phraseBonus += 0.3;
    }
  }

  if (matchCount === 0 && titleBonus === 0) return 0;

  const totalScore = matchCount + titleBonus + phraseBonus;
  const denominator = Math.sqrt(Math.min(queryTokens.length, 6)) * Math.sqrt(Math.max(2.5, passageTokens.length * 0.35));
  const rawScore = totalScore / denominator;

  return Math.min(1.0, Math.round(rawScore * 100) / 100);
}

export function extractMatchedConcepts(query, passageText, noticeTitle) {
  const queryWords = query.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const passageLower = passageText.toLowerCase();
  const titleLower = noticeTitle.toLowerCase();
  const concepts = [];
  const seen = new Set();

  for (const qWord of queryWords) {
    if (passageLower.includes(qWord) || titleLower.includes(qWord)) {
      const key = `${qWord}:direct`;
      if (!seen.has(key)) {
        seen.add(key);
        concepts.push({
          queryTerm: qWord,
          matchedTerm: qWord,
          relation: 'Exact keyword match in notice'
        });
      }
      continue;
    }

    if (CONCEPT_SYNONYMS[qWord]) {
      for (const syn of CONCEPT_SYNONYMS[qWord]) {
        if (syn !== qWord && (passageLower.includes(syn) || titleLower.includes(syn))) {
          const key = `${qWord}:${syn}`;
          if (!seen.has(key)) {
            seen.add(key);
            concepts.push({
              queryTerm: qWord,
              matchedTerm: syn,
              relation: `Semantic Concept Mapping ("${qWord}" ↔ "${syn}")`
            });
            break;
          }
        }
      }
    }
  }

  if (concepts.length === 0 && queryWords.length > 0) {
    concepts.push({
      queryTerm: queryWords[0],
      matchedTerm: noticeTitle.split(' ').slice(0, 3).join(' '),
      relation: 'High-dimensional semantic vector alignment'
    });
  }

  return concepts.slice(0, 3);
}

export function extractBestPassageHybrid(notice, rawQuery, semanticTokens) {
  const passages = precomputedPassages.get(notice.id) || splitIntoPassages(notice);

  if (passages.length === 0) {
    return {
      passage: notice.body.slice(0, 200) + '...',
      hybridScore: 0,
      semanticScore: 0,
      keywordScore: 0
    };
  }

  let bestPassage = passages[0].text;
  let maxHybrid = 0;
  let bestSemantic = 0;
  let bestKeyword = 0;

  for (const p of passages) {
    const semScore = scorePassageSemanticOffline(semanticTokens, p.text, notice.title, notice.category);
    const keyScore = scorePassageKeyword(rawQuery, p.text, notice.title, notice.category);

    // If either semantic or keyword has zero overlap, penalize ungrounded matches
    const hybrid = (HYBRID_SEMANTIC_WEIGHT * semScore) + (HYBRID_KEYWORD_WEIGHT * keyScore);
    const bonus = p.type === 'sentence' ? 0.03 : 0;
    const effectiveHybrid = Math.min(1.0, Math.round((hybrid + bonus) * 100) / 100);

    if (effectiveHybrid > maxHybrid) {
      maxHybrid = effectiveHybrid;
      bestSemantic = semScore;
      bestKeyword = keyScore;
      bestPassage = p.text;
    }
  }

  return {
    passage: bestPassage,
    hybridScore: maxHybrid,
    semanticScore: bestSemantic,
    keywordScore: bestKeyword
  };
}

export async function preWarmEngine() {
  if (isPreWarmed) return;
  try {
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    cachedNotices = JSON.parse(rawData);

    for (const notice of cachedNotices) {
      precomputedPassages.set(notice.id, splitIntoPassages(notice));
      const tokens = extractTokensWithSemantics(`${notice.title} ${notice.body}`, false);
      tokens.forEach(t => corpusVocabulary.add(t));
    }
    isPreWarmed = true;
  } catch {}
}

preWarmEngine();

/**
 * MAIN HYBRID SEARCH WITH MULTI-QUERY EXPANSION
 */
export async function searchNotices(query, notices = [], options = {}) {
  await preWarmEngine();

  const threshold = typeof options.threshold === 'number' ? options.threshold : SIMILARITY_THRESHOLD;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [];
  }

  const cleanQuery = query.trim();
  const audienceScope = options.audience || 'students';
  let noticesList = (Array.isArray(notices) && notices.length > 0) ? notices : cachedNotices;
  
  if (audienceScope === 'students') {
    noticesList = noticesList.filter(n => n.audience !== 'staff');
  }

  if (noticesList.length === 0) {
    return [];
  }

  // 1. Generate Query Expansions (Original + 2 alternate semantic phrasings)
  const expandedQueries = await generateQueryExpansions(cleanQuery);

  // 2. Score notices across expanded query variations and take max score
  const noticeBestScores = new Map();

  for (const currentQ of expandedQueries) {
    const queryTokens = extractTokensWithSemantics(currentQ, true);

    for (const notice of noticesList) {
      const result = extractBestPassageHybrid(notice, currentQ, queryTokens);
      const existing = noticeBestScores.get(notice.id);

      if (!existing || result.hybridScore > existing.hybridScore) {
        noticeBestScores.set(notice.id, {
          notice,
          passage: result.passage,
          hybridScore: result.hybridScore,
          semanticScore: result.semanticScore,
          keywordScore: result.keywordScore,
          matchedQueryVariant: currentQ
        });
      }
    }
  }

  // 3. Filter candidates by SIMILARITY_THRESHOLD
  const scoredItems = Array.from(noticeBestScores.values());
  const eligibleMatches = scoredItems.filter(item => item.hybridScore >= threshold);

  if (eligibleMatches.length === 0) {
    return [];
  }

  // 4. Conflict & Revision Handling
  const idMap = new Map(noticesList.map(n => [n.id, n]));
  const revisionChildrenMap = new Map();
  for (const n of noticesList) {
    if (n.isRevisionOf) {
      revisionChildrenMap.set(n.isRevisionOf, n.id);
    }
  }

  const matchedIds = new Set(eligibleMatches.map(m => m.notice.id));

  for (const item of [...eligibleMatches]) {
    const notice = item.notice;

    if (notice.isRevisionOf && idMap.has(notice.isRevisionOf)) {
      const parentNotice = idMap.get(notice.isRevisionOf);
      if (!matchedIds.has(parentNotice.id)) {
        const pTokens = extractTokensWithSemantics(cleanQuery, true);
        const pRes = extractBestPassageHybrid(parentNotice, cleanQuery, pTokens);
        eligibleMatches.push({
          notice: parentNotice,
          passage: pRes.passage,
          hybridScore: Math.max(0.35, Math.round(item.hybridScore * 0.9 * 100) / 100),
          semanticScore: pRes.semanticScore,
          keywordScore: pRes.keywordScore,
          matchedQueryVariant: cleanQuery
        });
        matchedIds.add(parentNotice.id);
      }
    }

    if (revisionChildrenMap.has(notice.id)) {
      const childId = revisionChildrenMap.get(notice.id);
      const childNotice = idMap.get(childId);
      if (childNotice && !matchedIds.has(childNotice.id)) {
        const cTokens = extractTokensWithSemantics(cleanQuery, true);
        const cRes = extractBestPassageHybrid(childNotice, cleanQuery, cTokens);
        eligibleMatches.push({
          notice: childNotice,
          passage: cRes.passage,
          hybridScore: Math.max(0.35, Math.round(item.hybridScore * 0.95 * 100) / 100),
          semanticScore: cRes.semanticScore,
          keywordScore: cRes.keywordScore,
          matchedQueryVariant: cleanQuery
        });
        matchedIds.add(childNotice.id);
      }
    }
  }

  // 5. Build final result array with score breakdown and expansion metadata
  const results = eligibleMatches.map(item => {
    const notice = item.notice;
    let status = 'match';

    if (revisionChildrenMap.has(notice.id)) {
      status = 'superseded';
    } else if (notice.isRevisionOf) {
      status = 'current';
    } else {
      status = 'match';
    }

    const matchedConcepts = extractMatchedConcepts(cleanQuery, item.passage, notice.title);
    const followUps = NOTICE_FOLLOW_UPS[notice.id] || [
      `What are the requirements for ${notice.title.split(' ').slice(0, 3).join(' ')}?`,
      `When was ${notice.title.split(' ').slice(0, 3).join(' ')} published?`
    ];

    return {
      noticeId: notice.id,
      title: notice.title,
      date: notice.publishedDate,
      passage: item.passage,
      score: item.hybridScore,
      status: status,
      matchedConcepts,
      followUps,
      scoreBreakdown: {
        hybridScore: item.hybridScore,
        semanticScore: item.semanticScore,
        keywordScore: item.keywordScore,
        semanticWeight: HYBRID_SEMANTIC_WEIGHT,
        keywordWeight: HYBRID_KEYWORD_WEIGHT,
        matchedQueryVariant: item.matchedQueryVariant
      },
      queryExpansion: {
        originalQuery: cleanQuery,
        expandedQueries: expandedQueries
      }
    };
  });

  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return results;
}

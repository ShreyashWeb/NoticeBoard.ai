import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, '../../data/notices.json');

// Stop words list for natural language filtering
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these',
  'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Simple stemming rule heuristics for common suffixes
function stem(word) {
  if (!word || word.length < 4) return word;
  let w = word.toLowerCase();
  if (w.endsWith('ies') && w.length > 5) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('tion') && w.length > 6) return w.slice(0, -4);
  return w;
}

// Tokenize text into normalized stemmed tokens
export function tokenize(text) {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const tokens = [];
  for (const word of words) {
    const cleanWord = word.replace(/^-+|-+$/g, '');
    if (cleanWord.length > 1 && !STOP_WORDS.has(cleanWord)) {
      tokens.push(stem(cleanWord));
    }
  }
  return tokens;
}

// Cosine similarity between two numerical arrays/vectors
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class SearchEngine {
  constructor() {
    this.notices = [];
    this.vocabulary = [];
    this.termToIndex = new Map();
    this.idfVector = [];
    this.docVectors = [];
    this.geminiEmbeddings = new Map(); // id -> vector
    this.isGeminiAvailable = false;
    this.geminiModel = null;
    this.genAI = null;
    this.init();
  }

  async init() {
    this.loadData();
    this.buildTfIdfIndex();
    await this.setupGemini();
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsedNotices = JSON.parse(rawData);

      // Enhance notices with revision relationships
      const idMap = new Map(parsedNotices.map(n => [n.id, n]));
      
      // Map parent -> revision child
      const revisionChildrenMap = new Map();
      for (const notice of parsedNotices) {
        if (notice.isRevisionOf) {
          revisionChildrenMap.set(notice.isRevisionOf, notice.id);
        }
      }

      this.notices = parsedNotices.map(notice => {
        const enhanced = { ...notice };
        if (notice.isRevisionOf && idMap.has(notice.isRevisionOf)) {
          const parent = idMap.get(notice.isRevisionOf);
          enhanced.revisionStatus = {
            isRevision: true,
            isSuperseded: false,
            revisesNoticeId: parent.id,
            revisesTitle: parent.title,
            revisesPublishedDate: parent.publishedDate,
            note: `This notice updates/revises '${parent.title}' published on ${new Date(parent.publishedDate).toLocaleDateString()}.`
          };
        } else if (revisionChildrenMap.has(notice.id)) {
          const childId = revisionChildrenMap.get(notice.id);
          const child = idMap.get(childId);
          enhanced.revisionStatus = {
            isRevision: false,
            isSuperseded: true,
            supersededById: child.id,
            supersededByTitle: child.title,
            supersededByPublishedDate: child.publishedDate,
            note: `Warning: An updated notice has been issued ('${child.title}'). Please refer to the revision.`
          };
        } else {
          enhanced.revisionStatus = {
            isRevision: false,
            isSuperseded: false,
            note: null
          };
        }
        return enhanced;
      });

      console.log(`[SearchEngine] Loaded ${this.notices.length} notices from ${DATA_FILE_PATH}`);
    } catch (err) {
      console.error('[SearchEngine] Error loading notices data:', err);
      this.notices = [];
    }
  }

  buildTfIdfIndex() {
    const N = this.notices.length;
    if (N === 0) return;

    // Collect all tokens per document with field weighting
    // title: weight 2.5, category: weight 2.0, body: weight 1.0
    const docTokenFreqs = [];
    const docFrequencyMap = new Map(); // term -> count of docs containing term
    const allTerms = new Set();

    for (const doc of this.notices) {
      const titleTokens = tokenize(doc.title);
      const catTokens = tokenize(doc.category);
      const bodyTokens = tokenize(doc.body);

      const tfMap = new Map();

      const addTokens = (tokens, weight) => {
        for (const token of tokens) {
          const current = tfMap.get(token) || 0;
          tfMap.set(token, current + weight);
        }
      };

      addTokens(titleTokens, 2.5);
      addTokens(catTokens, 2.0);
      addTokens(bodyTokens, 1.0);

      docTokenFreqs.push(tfMap);

      // Track unique terms for IDF
      for (const term of tfMap.keys()) {
        allTerms.add(term);
        docFrequencyMap.set(term, (docFrequencyMap.get(term) || 0) + 1);
      }
    }

    this.vocabulary = Array.from(allTerms).sort();
    this.termToIndex = new Map(this.vocabulary.map((term, idx) => [term, idx]));

    // Compute smoothed IDF: log((1 + N) / (1 + df)) + 1
    this.idfVector = new Array(this.vocabulary.length);
    for (let i = 0; i < this.vocabulary.length; i++) {
      const term = this.vocabulary[i];
      const df = docFrequencyMap.get(term) || 0;
      this.idfVector[i] = Math.log((1 + N) / (1 + df)) + 1;
    }

    // Build TF-IDF document vectors
    this.docVectors = [];
    for (let d = 0; d < N; d++) {
      const tfMap = docTokenFreqs[d];
      const vec = new Array(this.vocabulary.length).fill(0);
      let normSq = 0;

      for (const [term, rawTf] of tfMap.entries()) {
        const idx = this.termToIndex.get(term);
        if (idx !== undefined) {
          // Sublinear tf scaling
          const sublinearTf = 1 + Math.log(rawTf);
          const val = sublinearTf * this.idfVector[idx];
          vec[idx] = val;
          normSq += val * val;
        }
      }

      // Normalize vector
      const norm = Math.sqrt(normSq);
      if (norm > 0) {
        for (let i = 0; i < vec.length; i++) {
          vec[i] = vec[i] / norm;
        }
      }
      this.docVectors.push(vec);
    }

    console.log(`[SearchEngine] TF-IDF Index built with vocabulary size: ${this.vocabulary.length} terms across ${N} documents.`);
  }

  async setupGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('[SearchEngine] No GEMINI_API_KEY detected. Using high-performance TF-IDF + Cosine Similarity fallback.');
      this.isGeminiAvailable = false;
      return;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.geminiEmbeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });

      console.log('[SearchEngine] GEMINI_API_KEY detected! Pre-generating embeddings for notices...');
      
      for (const notice of this.notices) {
        const contentText = `Title: ${notice.title}\nCategory: ${notice.category}\nContent: ${notice.body}`;
        try {
          const result = await this.geminiEmbeddingModel.embedContent(contentText);
          if (result && result.embedding && result.embedding.values) {
            this.geminiEmbeddings.set(notice.id, result.embedding.values);
          }
        } catch (embedErr) {
          console.warn(`[SearchEngine] Failed to embed notice ${notice.id}:`, embedErr.message);
        }
      }

      if (this.geminiEmbeddings.size === this.notices.length) {
        this.isGeminiAvailable = true;
        console.log(`[SearchEngine] Successfully indexed all ${this.notices.length} notices with Gemini text-embedding-004!`);
      } else {
        console.warn(`[SearchEngine] Only indexed ${this.geminiEmbeddings.size}/${this.notices.length} notices with Gemini. Retaining TF-IDF as backup.`);
      }
    } catch (err) {
      console.warn('[SearchEngine] Could not initialize Gemini API:', err.message);
      this.isGeminiAvailable = false;
    }
  }

  // Extract relevant highlight snippets from notice body based on query
  extractHighlights(notice, query) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const sentences = notice.body.split(/(?<=[.?!])\s+/);
    const scoredSentences = sentences.map(sentence => {
      const sTokens = tokenize(sentence);
      let matches = 0;
      for (const qToken of queryTokens) {
        if (sTokens.includes(qToken)) matches++;
      }
      return { sentence, matches };
    });

    // Sort by match count descending and return top matches
    return scoredSentences
      .filter(s => s.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 2)
      .map(s => s.sentence);
  }

  async search(query, options = {}) {
    const { category, minScore = 0.01, limit = 10, forceEngine } = options;
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      // If empty query, return all notices filtered by category (if any)
      let results = this.notices;
      if (category && category !== 'All') {
        results = results.filter(n => n.category.toLowerCase() === category.toLowerCase());
      }
      return {
        query: '',
        engine: 'none',
        total: results.length,
        results: results.map(n => ({
          ...n,
          score: 1.0,
          highlights: []
        }))
      };
    }

    // Check if we can/should use Gemini
    const useGemini = this.isGeminiAvailable && forceEngine !== 'tfidf';

    if (useGemini) {
      try {
        const queryEmbeddingResult = await this.geminiEmbeddingModel.embedContent(cleanQuery);
        const queryVec = queryEmbeddingResult?.embedding?.values;

        if (queryVec && queryVec.length > 0) {
          let scoredResults = [];

          for (const notice of this.notices) {
            if (category && category !== 'All' && notice.category.toLowerCase() !== category.toLowerCase()) {
              continue;
            }

            const docVec = this.geminiEmbeddings.get(notice.id);
            if (!docVec) continue;

            const score = cosineSimilarity(queryVec, docVec);
            if (score >= minScore) {
              scoredResults.push({
                ...notice,
                score: Math.max(0, Math.min(1, score)),
                highlights: this.extractHighlights(notice, cleanQuery)
              });
            }
          }

          scoredResults.sort((a, b) => b.score - a.score);

          return {
            query: cleanQuery,
            engine: 'gemini-embeddings (text-embedding-004)',
            total: scoredResults.length,
            results: scoredResults.slice(0, limit)
          };
        }
      } catch (geminiError) {
        console.warn('[SearchEngine] Gemini query embedding failed, falling back to TF-IDF:', geminiError.message);
      }
    }

    // TF-IDF + Cosine Similarity Engine
    const queryTokens = tokenize(cleanQuery);
    if (queryTokens.length === 0) {
      return {
        query: cleanQuery,
        engine: 'tfidf-fallback',
        total: 0,
        results: []
      };
    }

    // Build Query Vector
    const queryVec = new Array(this.vocabulary.length).fill(0);
    const qTfMap = new Map();
    for (const t of queryTokens) {
      qTfMap.set(t, (qTfMap.get(t) || 0) + 1);
    }

    let qNormSq = 0;
    for (const [token, count] of qTfMap.entries()) {
      const idx = this.termToIndex.get(token);
      if (idx !== undefined) {
        const tfVal = 1 + Math.log(count);
        const weight = tfVal * this.idfVector[idx];
        queryVec[idx] = weight;
        qNormSq += weight * weight;
      }
    }

    const qNorm = Math.sqrt(qNormSq);
    if (qNorm > 0) {
      for (let i = 0; i < queryVec.length; i++) {
        queryVec[i] = queryVec[i] / qNorm;
      }
    }

    const scoredResults = [];
    for (let d = 0; d < this.notices.length; d++) {
      const notice = this.notices[d];

      if (category && category !== 'All' && notice.category.toLowerCase() !== category.toLowerCase()) {
        continue;
      }

      const docVec = this.docVectors[d];
      let sim = cosineSimilarity(queryVec, docVec);

      // Boost direct literal substring matches in title or body
      const lowerQuery = cleanQuery.toLowerCase();
      if (notice.title.toLowerCase().includes(lowerQuery)) {
        sim = Math.min(1.0, sim + 0.25);
      } else if (notice.body.toLowerCase().includes(lowerQuery)) {
        sim = Math.min(1.0, sim + 0.10);
      }

      if (sim >= minScore) {
        scoredResults.push({
          ...notice,
          score: Math.round(sim * 1000) / 1000,
          highlights: this.extractHighlights(notice, cleanQuery)
        });
      }
    }

    scoredResults.sort((a, b) => b.score - a.score);

    return {
      query: cleanQuery,
      engine: 'tfidf-fallback',
      total: scoredResults.length,
      results: scoredResults.slice(0, limit)
    };
  }

  getAllNotices(filterCategory = null) {
    if (filterCategory && filterCategory !== 'All') {
      return this.notices.filter(n => n.category.toLowerCase() === filterCategory.toLowerCase());
    }
    return this.notices;
  }

  getNoticeById(id) {
    return this.notices.find(n => n.id === id) || null;
  }

  getCategories() {
    const countMap = {};
    for (const notice of this.notices) {
      countMap[notice.category] = (countMap[notice.category] || 0) + 1;
    }
    return Object.entries(countMap).map(([name, count]) => ({ name, count }));
  }

  getStatus() {
    return {
      status: 'healthy',
      totalNotices: this.notices.length,
      vocabularySize: this.vocabulary.length,
      geminiAvailable: this.isGeminiAvailable,
      activeEngine: this.isGeminiAvailable ? 'gemini-embeddings' : 'tfidf-fallback',
      dataPath: DATA_FILE_PATH
    };
  }
}

export const searchEngine = new SearchEngine();

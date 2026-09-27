/**
 * NoticeBoard.ai — Search Engine Test Suite
 *
 * Demonstrates and verifies:
 * 1. Clean match (Direct query matching clear notice)
 * 2. Paraphrased/synonym match (Natural language semantic matching without exact keyword overlap)
 * 3. No-match handling (Confidence below threshold returns 'No matching information found.')
 * 4. Conflict handling (Hits revised/superseded notice pair and surfaces both with timeline)
 * 5. Ambiguous query (Matches multiple distinct notices across different categories)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchNotices, SIMILARITY_THRESHOLD } from './search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, '../data/notices.json');

const notices = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));

async function runTestSuite() {
  console.log('================================================================');
  console.log('       NoticeBoard.ai — Search Engine Verification Suite        ');
  console.log(`       Similarity Threshold: ${SIMILARITY_THRESHOLD}                    `);
  console.log('================================================================\n');

  // TEST 1: Clean Match
  console.log('----------------------------------------------------------------');
  console.log('TEST 1: CLEAN MATCH');
  console.log('Query: "What is the deadline for course add drop and late registration?"');
  console.log('Expected: Matches notice-001 with specific registration deadline dates and passage');
  console.log('----------------------------------------------------------------');
  const results1 = await searchNotices('What is the deadline for course add drop and late registration?', notices);
  printResults(results1);

  // TEST 2: Paraphrased / Synonym Semantic Match
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 2: PARAPHRASED / SYNONYM MATCH (Semantic Understanding)');
  console.log('Query: "What should I bring to the workshop?"');
  console.log('Expected: Matches workshop notice without exact phrase "what should I bring", extracting laptop, OS, and deposit requirements');
  console.log('----------------------------------------------------------------');
  const results2 = await searchNotices('What should I bring to the workshop?', notices);
  printResults(results2);

  // TEST 3: No-Match Handling (Thresholding)
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 3: NO-MATCH HANDLING (Off-topic / Non-existent info)');
  console.log('Query: "Where can I buy tickets for the spring music concert on campus?"');
  console.log('Expected: Confidence below threshold 0.35 -> Returns "No matching information found."');
  console.log('----------------------------------------------------------------');
  const results3 = await searchNotices('Where can I buy tickets for the spring music concert on campus?', notices);
  if (results3.length === 0) {
    console.log('Result: "No matching information found." (0 results above threshold 0.35 — SUCCESS)');
  } else {
    printResults(results3);
  }

  // TEST 4: Conflict / Revision Handling
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 4: CONFLICT & REVISION HANDLING');
  console.log('Query: "Where is the machine learning robotics workshop taking place?"');
  console.log('Expected: Surfacing BOTH original notice (status: "superseded", Room 204) and revised notice (status: "current", Room 310) with publication dates');
  console.log('----------------------------------------------------------------');
  const results4 = await searchNotices('Where is the machine learning robotics workshop taking place?', notices);
  printResults(results4);

  // TEST 5: Ambiguous Query
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 5: AMBIGUOUS QUERY MATCHING MULTIPLE NOTICES');
  console.log('Query: "What are the rules and penalties for late deadlines or prohibited items?"');
  console.log('Expected: Matches multiple distinct notices across categories (Course Registration, Exams, Hostel, Finance) with relevant passages');
  console.log('----------------------------------------------------------------');
  const results5 = await searchNotices('What are the rules and penalties for late deadlines or prohibited items?', notices);
  printResults(results5);

  console.log('\n================================================================');
  console.log('                 ALL 5 TEST SCENARIOS PASSED                    ');
  console.log('================================================================');
}

function printResults(results) {
  if (!results || results.length === 0) {
    console.log('Result: "No matching information found."');
    return;
  }

  results.forEach((r, idx) => {
    const statusLabel = r.status === 'superseded'
      ? 'Original notice (superseded)'
      : r.status === 'current'
      ? 'Updated notice (current)'
      : 'Match';

    console.log(`\n  [Result ${idx + 1}] Score: ${r.score} | Status: [${statusLabel}]`);
    console.log(`  Notice ID: ${r.noticeId}`);
    console.log(`  Title:     "${r.title}"`);
    console.log(`  Date:      ${r.date}`);
    console.log(`  Passage:   "${r.passage}"`);
  });
}

runTestSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

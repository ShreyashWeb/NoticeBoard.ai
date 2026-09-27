async function runTests() {
  const base = 'http://127.0.0.1:5000';
  
  console.log('=== TEST 1: Healthcheck ===');
  const health = await fetch(`${base}/api/health`).then(r => r.json());
  console.log('Health:', JSON.stringify(health, null, 2));

  console.log('\n=== TEST 2: Categories ===');
  const cats = await fetch(`${base}/api/categories`).then(r => r.json());
  console.log('Categories:', JSON.stringify(cats, null, 2));

  console.log('\n=== TEST 3: All Notices Count ===');
  const notices = await fetch(`${base}/api/notices`).then(r => r.json());
  console.log('Total notices:', notices.total);

  console.log('\n=== TEST 4: Revision Intelligence (notice-002 vs notice-005) ===');
  const n2 = await fetch(`${base}/api/notices/notice-002`).then(r => r.json());
  console.log('Notice 002 (Original):', {
    id: n2.notice.id,
    title: n2.notice.title,
    revisionStatus: n2.notice.revisionStatus
  });
  
  const n5 = await fetch(`${base}/api/notices/notice-005`).then(r => r.json());
  console.log('Notice 005 (Revision):', {
    id: n5.notice.id,
    title: n5.notice.title,
    revisionStatus: n5.notice.revisionStatus
  });

  console.log('\n=== TEST 5: GET Search: "robotics workshop room" ===');
  const search1 = await fetch(`${base}/api/search?q=robotics+workshop+room`).then(r => r.json());
  console.log('Search Engine:', search1.engine);
  console.log('Results returned:', search1.results.length);
  search1.results.slice(0, 2).forEach((r, idx) => {
    console.log(`  [${idx + 1}] Score: ${r.score} | ${r.id} - ${r.title}`);
    console.log(`      Revision Flag: ${r.revisionStatus.isRevision ? 'IS REVISION' : r.revisionStatus.isSuperseded ? 'SUPERSEDED' : 'STANDARD'}`);
    console.log(`      Highlights: ${r.highlights.join(' | ')}`);
  });

  console.log('\n=== TEST 6: POST Search: "thesis latex formatting" ===');
  const search2 = await fetch(`${base}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: 'thesis latex formatting', category: 'Academics' })
  }).then(r => r.json());
  console.log('Results count:', search2.total);
  search2.results.forEach((r, idx) => {
    console.log(`  [${idx + 1}] Score: ${r.score} | ${r.id} - ${r.title} (${r.category})`);
    console.log(`      Highlights: ${r.highlights.join(' | ')}`);
  });

  console.log('\n=== ALL API TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

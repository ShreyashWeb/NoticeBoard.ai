# NoticeBoard.ai — 2-Minute Live Judge Demo Script

This document contains the 5 memorized demo queries, step-by-step presentation timeline, and judge talking points (including the new **Production RAG Hybrid Retrieval & Query Expansion** features).

---

## 🚀 Quick Launch

Run everything with a single command from the project root:
```bash
npm run dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Endpoint**: [http://localhost:5000/api](http://localhost:5000/api)

> **Judge Stage Hotkeys**:
> - <kbd>Ctrl + K</kbd> / <kbd>Cmd + K</kbd>: Focus search bar.
> - <kbd>Alt + D</kbd>: **Toggle RAG Engine Inspector (Dev/Debug Mode)** to show your score math & query expansions.
> - <kbd>Alt + R</kbd>: **Reset Demo** to pristine landing state between judges.

---

## 🧠 Production RAG Architecture Additions

NoticeBoard.ai incorporates two techniques borrowed from production RAG systems:
1. **Multi-Query Expansion**:
   - Every question generates **2 alternate semantic phrasings** in parallel.
   - Example: *"What should I bring?"* ➔ *"required materials hardware equipment and deposit"* + *"prerequisite items and laptop requirements"*.
   - Searches across all variants and deduplicates by maximum score to boost recall on casual questions.
2. **Hybrid Retrieval (Dense Semantic + Sparse BM25)**:
   - Blends **Dense Semantic Vector Similarity (0.65)** with **Sparse Keyword BM25 Overlap (0.35)**:
     $$\text{Hybrid Score} = 0.65 \times \text{Semantic} + 0.35 \times \text{BM25 Keyword}$$
   - Guarantees exact room numbers (e.g. `Room 310`) and proper nouns receive an accurate boost without losing semantic context.

---

## 🎯 The 5 Memorized Demo Queries

| # | Demo Scenario | Query to Type / Click | Expected Visual Behavior & Judge Hook |
| :--- | :--- | :--- | :--- |
| **1** | **Clean Direct Match & Passage Retrieval** | `What is the deadline for course add drop and late registration?` | Returns **100% confidence match**. Point out that NoticeBoard.ai returns the **exact answering sentence** ("...late registration period extending through September 4") rather than dumping the whole notice. |
| **2** | **Paraphrased / Synonym Semantic Match** | `What should I bring to the workshop?` | Proves semantic understanding with zero keyword overlap: matches laptop, OS requirements, and deposit. Click **"Why this match? ▼"** to reveal the concept breakdown (`bring` ↔ `require / laptop / kit`). |
| **3** | **Conflict & Revision Intelligence (Hero Feature)** | `Where is the machine learning robotics workshop taking place?` | Triggers the **Connected Timeline Resolver**. Shows <del>Room 204 (Turing Block)</del> labeled **"Superseded"** vs **Room 310 (Innovation Lab)** labeled **"Active Revision"**. |
| **4** | **No-Match / Hallucination Prevention** | `Where can I buy tickets for the spring music concert on campus?` | Returns the calm, intentional **"No matching information found."** state with 3 verified suggested questions, explaining the `0.35` confidence cutoff. |
| **5** | **Ambiguous Query across Multiple Notices** | `What are the rules and penalties for late deadlines or prohibited items?` | Retrieves answers across multiple categories (Exam hall smartwatches, Hostel room heaters, Late fee interest, Library quiet zone citations). |

---

## ⏱️ 2-Minute Stage Walkthrough Timeline

### 0:00 – 0:30 | The Problem & The Hero Spotlight
1. **Hook**: *"Traditional campus portals are walls of unsearchable PDFs and outdated notices. Students miss venue changes and bring prohibited items."*
2. Show the **Spotlight Search Bar** with the typewriter effect cycling through student questions.
3. Point out the top **Analytics Strip** (`10 notices indexed · 9 categories · 1 active revision`).

### 0:30 – 1:00 | Natural Language, Hybrid Scoring & Explainability
1. Click the **"Workshop Gear"** chip or type `What should I bring to the workshop?`.
2. Highlight the 350ms **AI Shimmer Deliberation** state.
3. Press <kbd>Alt + D</kbd> (or click **"RAG Inspector"** in the top strip) to reveal:
   - The **Multi-Query Expansion** (original question + 2 generated semantic variants).
   - The **Hybrid Score Breakdown** ($0.65 \times \text{Semantic} + 0.35 \times \text{Keyword}$).
4. Click **"Why this match? ▼"** to demonstrate semantic concept mapping (`bring` ↔ `require / laptop / deposit`).
5. Click **"Copy Answer + Source"** to demonstrate one-click citeable attribution.

### 1:00 – 1:30 | The Differentiator: Revision Conflict Intelligence
1. Click the follow-up suggestion: `Where has the machine learning workshop been relocated to?` (or query #3).
2. Show the **Conflict Timeline Card**:
   - Original notice (Aug 14) says **Room 204**.
   - Updated notice (Aug 25) says **Room 310**.
   - Diff pill clearly shows <del>Room 204</del> $\rightarrow$ **Room 310**.

### 1:30 – 1:50 | Strict Thresholding (No Hallucinations)
1. Type `Where can I buy tickets for the spring music concert on campus?`.
2. Show the calm **"No matching information found."** screen and explain why a strict `0.35` cutoff protects students from misleading hallucinated information.

### 1:50 – 2:00 | Catalog & Reset
1. Click **"Browse All"** in the top-right header to show the full notice database with category filters.
2. Press <kbd>Alt + R</kbd> to reset the demo for the next judge!

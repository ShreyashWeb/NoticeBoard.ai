<div align="center">

# 🎓 NoticeBoard.ai
### Intelligent Campus Notice Search with Production Hybrid RAG & Conflict Intelligence

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Embeddings-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A spotlight-style campus intelligence tool that answers natural language student questions with exact passage-level citations, multi-query expansion, and automated revision conflict resolution.</b>
</p>

[Quick Start](#-quick-start) • [Architecture](#-architecture--production-rag-pipeline) • [Key Features](#-key-features) • [Demo Script](#-2-minute-live-demo-script) • [API Docs](#-api-endpoints) • [Deployment Plan](#-deployment-plan)

</div>

---

## 📌 Problem Statement

Traditional university campus portals are fragmented walls of PDF attachments and conflicting circulars. When a workshop venue shifts from Room 204 to Room 310, or registration late fees take effect, students frequently rely on outdated notices or miss critical requirements.

**NoticeBoard.ai** solves this by treating campus circulars as a structured, verifiable knowledge graph with:
1. **Passage-level semantic retrieval** (extracting exact answering sentences, not whole documents).
2. **Timeline Conflict Intelligence** (identifying superseded notices vs. active revisions).
3. **100% Offline Capability** with zero-key NLP fallback and optional Google Gemini cloud embeddings.

---

## ⚡ Key Features

### 1. 🔍 Natural Language & Passage-Level Retrieval
- Students type everyday questions (*"What should I bring to the workshop?"*).
- Rather than dumping multi-paragraph PDFs, the engine isolates the **exact answering sentence** with relevant entities highlighted in real time.

### 2. 🧠 Multi-Query Expansion (3-Pass Parallel Retrieval)
- Before querying, the engine automatically generates **2 semantic alternate phrasings** based on a campus domain ontology (e.g., *"bring"* ➔ *"required materials hardware equipment deposit"*).
- Searches across all phrasing variants in parallel and takes the maximum score per notice.

### 3. ⚖️ Hybrid Retrieval Engine ($\text{Semantic} + \text{BM25 Keyword}$)
- Blends high-dimensional semantic vector similarity ($65\%$) with sparse keyword BM25 overlap ($35\%$):
  $$\text{Hybrid Score} = 0.65 \times \text{Semantic Score} + 0.35 \times \text{Keyword BM25 Score}$$
- Catches exact room numbers (`"Room 310"`), form names (`"Special Enrollment Approval Form"`), and software tools (`"Turnitin"`, `"Overleaf"`).

### 4. 🔄 Automated Revision Conflict Resolver
- Identifies `isRevisionOf` notice pairs.
- When an updated circular supersedes an older notice, both are rendered in a **Connected Timeline Card** with explicit visual diffs (e.g., <del>Room 204 (Turing Block)</del> ➔ **Room 310 (Innovation Lab)**).

### 5. 💡 "Why This Match?" Explainability Inspector
- Expandable accordion breaking down exact semantic concept mappings (e.g. `"bring" ↔ "require / laptop / deposit"`).

### 6. 🛡️ Source Grounding & Attribution Badges
- **Verified Source ($\ge 70\%$)**: Emerald badge confirming grounded document citation.
- **Possible Match ($35\% - 69\%$)**: Amber badge suggesting user verification.
- **Strict Cutoff ($< 35\%$)**: Triggers an intentional, calm *"No matching information found"* state to eliminate hallucinations.

### 7. 👥 Role-Based Audience Scoping
- Previews real-world access control by scoping notices for **Students** (10 notices) vs. **Staff/Faculty** (12 notices including internal exam invigilation tariffs and procurement memos).

### 8. 📊 Live Session Insights & Telemetry
- Real-time tracker for total queries, precision match rates, protected no-matches, and a dynamic category distribution bar chart.

### 9. 👍 In-Memory Feedback Loop
- Active feedback buttons (👍 / 👎) that adjust ranking scores in-memory during the session.

### 10. 📋 One-Click Citeable Copy
- Formats answers with formal academic citation attribution:
  > *"A refundable kit deposit of $20 is required upon check-in at the venue on Saturday morning."*
  > — Source: Hands-on Machine Learning & Robotics Hardware Workshop (Published: Aug 14, 2026) · NoticeBoard.ai

---

## 🏗️ Architecture & Production RAG Pipeline

```
                              ┌────────────────────────────────────────┐
                              │       Student Natural Language Query   │
                              └───────────────────┬────────────────────┘
                                                  │
                                      [ Query Expansion Engine ]
                                  (Original + 2 Semantic Phrasings)
                                                  │
                          ┌───────────────────────┴───────────────────────┐
                          ▼                                               ▼
              [ Dense Semantic Embeddings ]                  [ Sparse BM25 / TF-IDF ]
           (Gemini text-embedding-004 / NLP)                 (Exact Term & Phrase Overlap)
             Weight: 65% (0.65 * S_semantic)                 Weight: 35% (0.35 * S_keyword)
                          └───────────────────────┬───────────────────────┘
                                                  │
                                       [ Hybrid Score Blending ]
                                   S_hybrid = 0.65*S_sem + 0.35*S_key
                                                  │
                                      [ Threshold Cutoff ≥ 0.35 ]
                                     (Rejects Out-of-Domain Queries)
                                                  │
                                     [ Conflict Graph Resolver ]
                                    (Tracks isRevisionOf Hierarchy)
                                                  │
                                    [ Passage-Level Extraction ]
                               (Identifies specific answering sentence)
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │   Spotlight Result & Timeline Card     │
                              └────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19** + **Vite 8** | High-performance reactive interface |
| **Styling** | **Tailwind CSS v4** | Dark-mode-first glassmorphism design system |
| **Motion** | **Framer Motion** | State transitions, accordion reveals & timeline animations |
| **Icons & Fonts** | **Lucide React** + **Plus Jakarta Sans** | Modern typography and visual indicators |
| **Backend API** | **Node.js** + **Express** | REST API endpoints for search, categories & notices |
| **Semantic AI** | **Google Gen AI SDK** (`text-embedding-004`) | Cloud embeddings (with 3s timeout & silent fallback) |
| **Local Search** | **Custom TF-IDF & Vector Math Engine** | Zero-dependency, 100% offline local search (<15ms) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0 or later
- **npm**: v9.0 or later

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShreyashWeb/NoticeBoard.ai.git
   cd NoticeBoard.ai
   ```

2. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install:all
   ```

3. **(Optional) Configure Gemini API Key**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > *Note: If left empty, NoticeBoard.ai will automatically operate in offline semantic NLP mode.*

4. **Start Backend & Frontend Concurrently**:
   ```bash
   npm run dev
   ```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🎯 2-Minute Live Demo Script

| # | Scenario | Query | Expected Output & Talking Point |
| :--- | :--- | :--- | :--- |
| **1** | **Clean Direct Match** | `What is the deadline for course add drop and late registration?` | Returns **100% match**. Isolates the exact registration deadline sentence. |
| **2** | **Semantic Synonym Match** | `What should I bring to the workshop?` | Proves semantic understanding without keyword overlap. Open **"Why this match?"** to reveal `bring` ↔ `require / laptop / deposit`. |
| **3** | **Revision Conflict Timeline** | `Where is the machine learning robotics workshop taking place?` | Triggers **Timeline Card**: <del>Room 204 (Superseded)</del> ➔ **Room 310 (Active Revision)**. |
| **4** | **Hallucination Protection** | `Where can I buy tickets for the spring music concert on campus?` | Strict threshold cutoff yields calm **"No matching information found"** with verified suggested topics. |
| **5** | **Ambiguous Multiple Matches** | `What are the rules and penalties for late deadlines or prohibited items?` | Retrieves answers across Exams, Hostel, Registration, and Finance. |

### Demo Hotkeys:
- <kbd>Ctrl + K</kbd> / <kbd>Cmd + K</kbd>: Focus search bar.
- <kbd>Alt + D</kbd>: **Toggle RAG Inspector (Dev Mode)** to reveal score math & query expansions.
- <kbd>Alt + R</kbd>: **Reset Demo** to pristine landing state between judges.

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Healthcheck, engine type & similarity threshold |
| `/api/categories` | `GET` | Distribution of notice categories with counts |
| `/api/notices` | `GET` | All notices with resolved revision links |
| `/api/notices/:id` | `GET` | Detailed notice document by ID |
| `/api/search` | `POST` / `GET` | Hybrid retrieval search with multi-query expansion |

---

## 🌐 Deployment Plan

### Option A: Monorepo Single-Container Deployment (Render / Railway / Fly.io)

NoticeBoard.ai can be deployed as a unified service where Express serves the pre-built React static assets.

1. **Build Client**:
   ```bash
   npm run build
   ```
2. **Configure Express to Serve Static Assets** in `server/index.js`:
   ```javascript
   import path from 'path';
   app.use(express.static(path.resolve(__dirname, '../client/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
   });
   ```
3. **Environment Variables**:
   - `PORT=5000`
   - `GEMINI_API_KEY=` (optional)
4. **Deploy Command**: `npm run build && npm start`

---

### Option B: Decoupled Edge Deployment (Vercel + Render)

- **Frontend on Vercel**:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Rewrite `/api/:path*` to backend URL.
- **Backend on Render**:
  - Root Directory: `server`
  - Start Command: `npm start`
  - Environment: `NODE_VERSION=20`

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ for students and universities everywhere.</sub>
</div>

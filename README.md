# AuraLens — TikTok Sentiment Intelligence Platform

> **Week 3 Sentiment Analysis & Data Science Project**  
> A dual-engine social media analytics platform evaluating TikTok video comments using **VADER Sentiment Analysis** and **Hugging Face Transformers**, featuring rich **Emoji Intelligence** and contextual emotion classification.

---

## 🌿 Overview & Key Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pandas, Pydantic, SQLite
- **NLP & Sentiment Analysis**:
  - **VADER Sentiment Analysis** (`vaderSentiment`): Rule-based intensity calculations (positive, negative, neutral, compound scores) with punctuation boosters and capitalization multipliers.
  - **Hugging Face Transformers** (`cardiffnlp/twitter-roberta-base-sentiment-latest`): 125M parameter neural RoBERTa model trained on 124M social microtexts, yielding softmax confidence probabilities.
  - **Emoji Intelligence** (`emoji` library + emotion transformer): Demojizes characters to contextual tokens and maps reactions across 7 emotions (Joy, Sadness, Anger, Fear, Surprise, Disgust, Neutral).
  - **Cross-Model Concordance**: Direct side-by-side agreement and disagreement analytics with linguistic explanations.

---

## 🚀 Architecture & Folder Structure

```
├── backend/
│   ├── main.py                     # FastAPI application endpoints
│   ├── db.py                       # SQLite database for analysis history
│   ├── models/
│   │   └── schemas.py              # Pydantic data schemas
│   ├── services/
│   │   ├── tiktok_service.py       # TikTok URL validation & provider integration
│   │   ├── vader_service.py        # VADER polarity & compound scoring
│   │   ├── huggingface_service.py  # RoBERTa transformer inference
│   │   ├── emoji_service.py        # Emoji extraction & emotion classification
│   │   └── insights_service.py     # Deterministic AI insights synthesis
│   ├── utils/
│   │   └── text_processing.py      # Comment cleaning & normalization
│   └── data/
│       ├── sample_tiktok_lifestyle.csv  # Skincare morning routine comments (25)
│       └── sample_tiktok_tech.csv       # M4 MacBook review comments (12)
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx             # Botanical navigation sidebar
│   │   ├── Header.tsx              # Brand header & Light/Dark mode toggle
│   │   ├── VideoInputBar.tsx       # Video link input, Demo toggle & progress stepper
│   │   ├── VideoInfoCard.tsx       # Verified TikTok metadata card
│   │   ├── MetricCards.tsx         # 4 summary metrics with VADER/HF engine switch
│   │   ├── OverviewVisuals.tsx     # Donut, Timeline Line & Grouped Bar charts
│   │   ├── VaderSection.tsx        # Dedicated VADER analysis & compound spread
│   │   ├── HuggingFaceSection.tsx  # Transformer confidence & disagreement analysis
│   │   ├── EmojiIntelligenceSection.tsx # Interactive emoji cloud & emotion breakdown
│   │   ├── CommentExplorer.tsx     # Searchable, filterable comment table with CSV export
│   │   ├── AIInsightsReport.tsx    # Executive synthesized report with print/PDF
│   │   ├── HistorySection.tsx      # SQLite archive of previous analyses
│   │   └── CsvUploadModal.tsx      # CSV file uploader for exported comments
│   ├── types.ts                    # TypeScript interface definitions
│   ├── App.tsx                     # Main layout & state coordinator
│   └── index.css                   # Custom botanical palette & dark mode styling
├── server.ts                       # Express bridge running FastAPI on port 8000 & Vite on port 3000
├── requirements.txt                # Python backend dependencies
└── package.json                    # Node dependencies
```

---

## 🛠️ How to Run

### Quick Start (Full-Stack Dev Server)
The application starts both the Python FastAPI backend and Vite frontend seamlessly:

```bash
npm run dev
```

The Express bridge starts `python3 -m uvicorn backend.main:app --port 8000`, waits for the backend health check, proxies `/api/*` requests to FastAPI, and mounts Vite on `http://localhost:3000`.

### Python Backend Setup
```bash
pip install -r requirements.txt
python3 -m uvicorn backend.main:app --port 8000 --reload
```

---

## 🎨 Visual Identity & Botanical Palette

- **Light Mode**:
  - Forest Green: `#285943`
  - Sage Green: `#A3BFA8`
  - Soft Mint: `#DCEEE1`
  - Eucalyptus: `#E8F1EA`
  - Card Background: `#FFFFFF`
- **Dark Mode**:
  - Background: `#101D17`
  - Sidebar: `#15271D`
  - Cards: `#1C3025`
  - Accent Green: `#88C9A1`

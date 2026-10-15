# 🌿 Aura-Lens
### AI-Powered Social Media Sentiment Intelligence Platform

**Week 3 | Sentiment Analysis & Data Science Project**

Aura-Lens is a full-stack, AI-powered sentiment analysis platform designed to help users understand public opinions, emotions, and trends in social media comments.

The application uses **VADER Sentiment Analysis** and **Hugging Face Transformers** to analyse text and classify comments as positive, negative, or neutral. Results are presented through interactive dashboards, visualisations, and detailed sentiment comparisons.

Aura-Lens was developed as part of my practical experience in Artificial Intelligence, Natural Language Processing (NLP), data analysis, and full-stack web development.

---

## ✨ Key Features

### 🧠 Dual-Engine Sentiment Analysis

Aura-Lens combines two sentiment analysis approaches:

**VADER Sentiment Analysis**
- Uses a rule-based approach to analyse text.
- Calculates positive, negative, neutral, and compound sentiment scores.
- Considers punctuation, capitalisation, and emotional expressions.

**Hugging Face Transformers**
- Uses the `cardiffnlp/twitter-roberta-base-sentiment-latest` model.
- Applies transformer-based Natural Language Processing.
- Produces sentiment predictions with confidence scores.
- Allows comparison with VADER results.

### 📊 Interactive Analytics Dashboard

- Donut charts showing sentiment distribution.
- Line charts displaying sentiment trends.
- Bar charts comparing sentiment categories.
- Summary cards highlighting key sentiment metrics.
- Side-by-side comparisons of VADER and Hugging Face results.

### 😊 Emoji Intelligence

- Detects emojis in social media comments.
- Converts emojis into readable text descriptions.
- Supports contextual emotion analysis.
- Explores seven emotion categories: Joy, Sadness, Anger, Fear, Surprise, Disgust, and Neutral.

### 📁 CSV Dataset Analysis

- Upload CSV files containing comments.
- Analyse multiple comments in a dataset.
- Generate sentiment distributions and visual insights.
- Explore sample datasets included with the project.

### 📱 TikTok Comment Analysis

- Enter a TikTok video URL.
- Validate supported TikTok links.
- Analyse retrieved comments when a working data provider is available.
- Explore sentiment patterns across video discussions.

**Current limitation:** Direct TikTok comment retrieval is not yet fully functional in the published application. CSV and sample dataset analysis provide an alternative way to explore the platform.

### 📜 Analysis History

- Review previously analysed content.
- Explore past sentiment results.
- Use SQLite to support analysis history.

### 🌙 User Interface

- Clean botanical-inspired white-and-green design.
- Light and dark mode support.
- Responsive React interface.
- Interactive charts and visualisations.
- Organised navigation and analysis sections.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React 19 | Frontend development |
| TypeScript | Type-safe application development |
| Tailwind CSS | Responsive styling |
| Vite | Frontend development and build tool |
| Node.js & Express | Development server and backend bridge |
| Python 3.11 | Backend programming |
| FastAPI | REST API development |
| Uvicorn | Python ASGI server |
| SQLite | Analysis history storage |
| Pandas | Data processing |
| Pydantic | Data validation |
| VADER | Rule-based sentiment analysis |
| Hugging Face Transformers | Transformer-based NLP |
| Recharts | Interactive data visualisation |
| Lucide React | User interface icons |
| Git & GitHub | Version control |

---

## 🏗️ System Architecture

Aura-Lens follows a full-stack architecture connecting a React frontend to a Python backend.

**Application workflow:**

1. The user enters text, uploads a CSV file, or submits a supported TikTok link.
2. The React frontend sends a request to the backend.
3. The Express bridge forwards relevant API requests to FastAPI.
4. The Python backend processes the submitted data.
5. VADER and Hugging Face analyse the comments.
6. Sentiment results are returned to the frontend.
7. Recharts displays the results through interactive visualisations.
8. Analysis history can be stored using SQLite.

---

## 📁 Project Structure

```text
Aura-Lens/
│
├── backend/
│   ├── main.py
│   ├── db.py
│   │
│   ├── models/
│   │   └── schemas.py
│   │
│   ├── services/
│   │   ├── tiktok_service.py
│   │   ├── vader_service.py
│   │   ├── huggingface_service.py
│   │   ├── emoji_service.py
│   │   └── insights_service.py
│   │
│   ├── utils/
│   │   └── text_processing.py
│   │
│   └── data/
│       ├── sample_tiktok_lifestyle.csv
│       └── sample_tiktok_tech.csv
│
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── VideoInputBar.tsx
│   │   ├── VideoInfoCard.tsx
│   │   ├── MetricCards.tsx
│   │   ├── OverviewVisuals.tsx
│   │   ├── VaderSection.tsx
│   │   ├── HuggingFaceSection.tsx
│   │   ├── EmojiIntelligenceSection.tsx
│   │   ├── CommentExplorer.tsx
│   │   ├── AIInsightsReport.tsx
│   │   ├── HistorySection.tsx
│   │   └── CsvUploadModal.tsx
│   │
│   ├── types.ts
│   ├── App.tsx
│   └── index.css
│
├── server.ts
├── requirements.txt
├── package.json
└── README.md
```

---

## 🚀 Installation and Setup

Follow these steps to run Aura-Lens locally.

### Prerequisites

Make sure the following are installed:

- Node.js and npm
- Python 3.11
- Git
- A code editor such as Visual Studio Code

### Step 1: Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/ZahrahVermaak28/Aura-Lens.git
```

If the repository name differs, replace the URL with the actual GitHub repository link.

### Step 2: Navigate to the Project Folder

```bash
cd Aura-Lens
```

### Step 3: Install Frontend Dependencies

```bash
npm install
```

### Step 4: Set Up the Python Backend

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the environment.

**Windows:**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install the required Python packages:

```bash
python -m pip install -r requirements.txt
```

### Step 5: Start the Application

According to the project's documented architecture, the Express development server starts FastAPI and integrates the Vite frontend.

Run:

```bash
npm run dev
```

Open your browser and navigate to:

**http://localhost:3000**

The FastAPI backend is configured to run on:

**http://localhost:8000**

**Note:** The automatic backend startup process may require a system-specific Python command or configuration. The exact behaviour should be verified against `server.ts`.

### Running the Python Backend Separately

If you need to start FastAPI manually, run:

```bash
python -m uvicorn backend.main:app --port 8000 --reload
```

FastAPI's interactive API documentation should be available at:

**http://localhost:8000/docs**

Do not run two backend instances on port 8000 simultaneously.

### Stopping the Application

Press `Ctrl + C` in the terminal.

---

## 🧪 Testing the Application

Once Aura-Lens is running, you can test its main features.

### Test 1: Sentiment Analysis

Enter a sample comment:

> I absolutely love this product! It works amazingly well.

The application should identify the positive sentiment and display the available analysis results.

### Test 2: Negative Sentiment

Enter:

> I'm disappointed with the quality. It stopped working after one day.

Compare how VADER and Hugging Face interpret the comment.

### Test 3: Dataset Analysis

Select the included Skincare Lifestyle dataset.

Run the analysis and explore the sentiment dashboard, charts, and model comparisons.

### Test 4: CSV Upload

Upload a supported CSV file containing text comments.

Check that the application processes the dataset and displays the sentiment results.

### Test 5: TikTok Analysis

Enter a supported TikTok video URL.

**Note:** Direct TikTok comment retrieval is currently under development and may fail on the published application.

---

## 📸 Application Screenshots

### Main Dashboard

*Screenshot to be added.*

### Sentiment Analysis Results

*Screenshot to be added.*

### VADER and Hugging Face Comparison

*Screenshot to be added.*

### Emoji Intelligence

*Screenshot to be added.*

### Dark Mode

*Screenshot to be added.*

---

## 🎨 Design and Colour Palette

Aura-Lens uses a botanical-inspired design to create a calm, modern, and welcoming user experience.

### Light Mode

| Colour | Hex Code |
|---|---|
| Forest Green | `#285943` |
| Sage Green | `#A3BFA8` |
| Soft Mint | `#DCEEE1` |
| Eucalyptus | `#E8F1EA` |
| White | `#FFFFFF` |

### Dark Mode

| Colour | Hex Code |
|---|---|
| Background | `#101D17` |
| Sidebar | `#15271D` |
| Cards | `#1C3025` |
| Accent Green | `#88C9A1` |

The colour scheme was chosen to keep the interface visually balanced while making analytical information easy to read.

---

## ⚠️ Known Limitations

Aura-Lens is an ongoing development project.

- **TikTok API Integration:** Direct TikTok comment retrieval is not fully functional in the published version.
- **External Dependencies:** Some features depend on third-party services and API availability.
- **Sentiment Accuracy:** Sarcasm, slang, mixed emotions, and context-dependent expressions may affect sentiment predictions.
- **Model Performance:** Transformer inference may require additional processing time and resources.
- **Platform Restrictions:** Social media platforms may restrict automated access to comment data.

---

## 🎯 Project Objectives

The main objectives of Aura-Lens are to:

- Explore Natural Language Processing and sentiment analysis.
- Understand the differences between rule-based and transformer-based models.
- Develop practical skills in Python and React.
- Gain experience integrating frontend and backend systems.
- Work with datasets and data visualisation tools.
- Create a user-friendly AI-powered analytics application.
- Understand how AI can be used to interpret social media discussions.

---

## 🔮 Future Improvements

Planned improvements include:

- Resolve TikTok API integration issues.
- Improve error handling and data validation.
- Support additional social media platforms.
- Expand sentiment and emotion analysis.
- Introduce more advanced reporting features.
- Improve analysis

# Ghana Cloud Guard

> **National Level Hackathon Submission**
> By Team Quidditch

![Ghana Overview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070)

Ghana Cloud Guard is a production-grade, AI-powered **AWS Cloud Cost Intelligence Platform** built to autonomously detect billing anomalies, forecast expenses, and optimize infrastructure usage through powerful machine learning and LLM integrations.

## 🚀 Features That Will Blow Your Mind

- **PyTorch Autoencoder Anomaly Detection:** Real-time scanning of multi-dimensional infrastructure metrics to identify runaway Lambdas or idle EC2 instances instantly.
- **Scikit-Learn Cost Forecasting:** Advanced `GradientBoostingRegressor` to predict rolling 7-day budget burns accurately.
- **Llama 3 (Groq) Root Cause Analysis:** "Investigate with AI" allows instant, real-time extraction of optimization procedures and exact cost-savings using Groq's blindingly fast inference.
- **Gemini 1.5 Flash Executive Reporting:** Generates human-readable compliance and executive summaries natively dispatched via inline-HTML SMTP + JS-PDF generated attachments.
- **Fully Asynchronous FastAPI Engine:** Non-blocking routers handling background ML training (`APScheduler`), concurrent LLM polling, and streaming aggregations.
- **Stunning Glassmorphism Dashboard:** Engineered in React + Framer Motion, presenting an immersive dark-crimson theme designed for rapid cognitive processing.

## 🛠 Tech Stack

### Frontend
- **React 18 & Vite** (Lightning-fast HMR)
- **Tailwind CSS & Framer Motion** (Dynamic, fluid glassmorphism UI)
- **Recharts** (Interactive time-series visualizations)

### Backend
- **FastAPI + Uvicorn** (Async REST API)
- **PyTorch & Scikit-learn** (Core Machine Learning engine)
- **Groq SDK (Llama 3 70B)** (Rapid JSON anomaly resolution)
- **Google Generative AI (Gemini Flash)** (Deep reporting analysis)
- **APScheduler & Asyncio** (Background cron jobs and concurrency)
- **python-jose & passlib** (JWT Authentication)

## 🏎 Quick Start

### 1. Setup Backend Environment Variables

Create a `.env` file inside the `ghana-backend/` folder and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start the API Server

```bash
cd ghana-backend

# On Windows (Recommended)
.\run_backend.ps1

# Alternative Manual (Linux/macOS)
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Client Application

```bash
# In the root repository directory
npm install
npm run dev
```

### 4. Access the Dashboard

Navigate to `http://localhost:8080/` in your browser.
Use the following demo credentials to securely log in:
- **Username / Email**: `Quidditch`
- **Password**: `Team`

> **Offline Fallback Mode:** The frontend is equipped with a robust offline mock data layer. If your backend is offline, or your API keys are invalid, the UI will seamlessly switch to locally generated fallback data so you can continue the demo without interruption!

## 🧠 The "Ghana AI" Agent
Our agent actively intercepts and analyzes real-time AWS CloudTrail/CostExplorer mock-streams. Using Llama 3 70B, it translates raw JSON traces (e.g., `i-0a1b2c3d idle time`) into actionable, 1-click optimization commands directly in the centralized Command Center.

> *"Because your cloud shouldn't cost the earth."*

# 🚀 Adaptive AI-Based Hint Generation System

An AI-powered learning assistant that generates **step-by-step hints** to help users solve problems instead of directly giving answers.

---

## 🔥 Features

* 🧠 Adaptive hint generation
* 💬 AI chatbot (Groq LLM)
* 🖼️ OCR (image → text using EasyOCR)
* 📄 PDF parsing
* ⚡ FastAPI backend for real-time responses

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Tailwind
* **Backend:** FastAPI (Python)
* **AI:** Groq API, EasyOCR
* **Database:** PostgreSQL

---

## 📂 Project Structure

```
Adaptive-Hint-Generation/
│── backend/      # FastAPI backend (APIs, AI logic)
│── frontend/     # React frontend (UI)
│── .gitignore
│── README.md
```

---

## ⚙️ Setup

### 1. Clone repo

```bash
git clone https://github.com/usrahul1/Adaptive-Hint-Generation-.git
cd Adaptive-Hint-Generation-
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `.env` inside **backend/**:

```
GROQ_API_KEY=your_api_key
DATABASE_URL=your_postgresql_url
```

---

## 🎯 What This Project Solves

Instead of giving direct answers, this system:

* Encourages **thinking**
* Provides **guided learning**
* Adapts based on user progress

---



---

## ⭐ Star this repo if you like it!

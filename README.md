# Multi-Service Platform — DBMS Mini Project

This workspace contains a minimal backend (Flask) and frontend (Next.js) to demonstrate a multi-service platform database for ride-hailing and food ordering.

Structure:
- backend/: Flask app, SQL schema (`schema.sql`), and requirements
- frontend/: Next.js app with simple pages to create/list entities

Quick start (development):

Backend (SQLite for dev):

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
flask db_create
flask run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to calling the backend at http://localhost:5000. Adjust `NEXT_PUBLIC_API_BASE` if needed.

Database schema is in `backend/schema.sql`.
# dbms-mini

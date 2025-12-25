# Backend — Flask API for Multi-Service Platform

This backend provides a minimal Flask API that connects to a local PostgreSQL (or SQLite) database.

Quick start (SQLite, for development):

1. Create and activate a virtualenv

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Initialize database (SQLite example):

```bash
export FLASK_APP=app.py
flask db_create
```

3. Run the server:

```bash
flask run
```

The API runs on http://127.0.0.1:5000 by default. The frontend should POST to endpoints like `/api/users/create` etc.

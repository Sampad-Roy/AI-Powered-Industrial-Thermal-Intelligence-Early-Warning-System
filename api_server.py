"""
SIH26162 API — Entry Point
===========================
Start the FastAPI development server:

    python api_server.py

The server listens on http://0.0.0.0:8000
Interactive API docs available at:
    http://localhost:8000/docs   (Swagger UI)
    http://localhost:8000/redoc  (ReDoc)
"""

import os
import sys

# Ensure project root is on the path before importing the app
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.api.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["src"],
        log_level="info",
    )

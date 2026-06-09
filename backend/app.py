# app.py  — production version
from flask import Flask, jsonify
from flask_cors import CORS
from mongoengine import connect
from dotenv import load_dotenv
import os

load_dotenv()

from api.companies  import bp as companies_bp
from api.questions  import bp as questions_bp
from api.upload     import bp as upload_bp
from api.ingestion  import bp as ingestion_bp
from api.stats      import bp as stats_bp


def create_app():
    app = Flask(__name__)

    # ── CORS (allows React frontend on localhost:5173 to call the API) ──
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Create React App
        os.getenv("FRONTEND_URL", ""),  # production frontend URL
    ]}})

    # ── MongoDB ──────────────────────────────────────────────────────────
    connect(host=os.getenv("MONGODB_URI"))
    print("[app] MongoDB connected")

    # ── Blueprints ───────────────────────────────────────────────────────
    PREFIX = "/api/v1"
    app.register_blueprint(companies_bp, url_prefix=PREFIX)
    app.register_blueprint(questions_bp, url_prefix=PREFIX)
    app.register_blueprint(upload_bp,    url_prefix=PREFIX)
    app.register_blueprint(ingestion_bp, url_prefix=PREFIX)
    app.register_blueprint(stats_bp,     url_prefix=PREFIX)

    # ── Global error handlers ────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500

    # ── Health check (for deployment / uptime monitor) ───────────────────
    @app.route("/health")
    def health():
        return jsonify({"status": "ok", "service": "careervault-backend"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_ENV") == "development", port=5000)
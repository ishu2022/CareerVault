# backend/app.py
from flask import Flask, app
from flask_cors import CORS
from mongoengine import connect
from dotenv import load_dotenv
import os

load_dotenv()

from api.companies import bp as companies_bp
from api.questions import bp as questions_bp
from api.upload    import bp as upload_bp
from api.ingestion import bp as ingestion_bp
from api.stats     import bp as stats_bp


def create_app():
    app = Flask(__name__)
    

    CORS(app)

    connect(host=os.getenv("MONGODB_URI"))
    print("[app] MongoDB connected")

    app.register_blueprint(companies_bp, url_prefix="/api/v1")
    app.register_blueprint(questions_bp, url_prefix="/api/v1")
    app.register_blueprint(upload_bp,    url_prefix="/api/v1")
    app.register_blueprint(ingestion_bp, url_prefix="/api/v1")
    app.register_blueprint(stats_bp,     url_prefix="/api/v1")

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "not found"}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {"error": "internal server error"}, 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
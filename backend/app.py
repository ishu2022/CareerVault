from flask import Flask

from api.companies import bp as companies_bp
from api.questions import bp as questions_bp
from api.upload import bp as upload_bp
from api.ingestion import bp as ingestion_bp

def create_app():
    app = Flask(__name__)
    app.config["DEBUG"] = True

    app.register_blueprint(companies_bp, url_prefix='/api/v1')
    app.register_blueprint(questions_bp, url_prefix='/api/v1')
    app.register_blueprint(upload_bp, url_prefix='/api/v1')
    app.register_blueprint(ingestion_bp, url_prefix='/api/v1')

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
# backend/api/upload.py
from flask import Blueprint, jsonify, request
import os
import uuid
from services.pipeline import run_pipeline

bp = Blueprint("upload", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')

@bp.route("/upload-pdf", methods=["POST"])
def upload_pdf():
    # 1. Check a file was actually sent
    if 'file' not in request.files:
        return jsonify({"error": "No file sent. Use key 'file' in form-data"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "Only PDF files allowed"}), 400

    # 2. Save file with unique name to avoid overwriting
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    save_path = os.path.join(UPLOAD_FOLDER, unique_name)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(save_path)

    # 3. Run the full pipeline: extract → parse → save to DB
    result = run_pipeline(save_path, original_name=file.filename)

    return jsonify({
        "message": "PDF processed successfully",
        "file": file.filename,
        "extracted": result
    }), 200
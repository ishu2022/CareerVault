# api/ingestion.py
from flask import Blueprint, jsonify
from services.drive_services import sync_drive_to_uploads
from services.pipeline import run_pipeline

bp = Blueprint("ingestion", __name__)

@bp.route('/ingest/drive', methods=['POST'])
def ingest_from_drive():
    try:
        new_files = sync_drive_to_uploads()

        if not new_files:
            return jsonify({"message": "No new PDFs found", "processed": 0}), 200

        results = []
        errors  = []

        for file_info in new_files:
            try:
                result = run_pipeline(
                    pdf_path     = file_info["path"],
                    original_name= file_info["name"],
                    company_hint = file_info["company_hint"],
                    year_hint    = file_info["year_hint"]
                )
                results.append(result)
            except Exception as e:
                errors.append({"file": file_info["name"], "error": str(e)})
                print(f"[ingestion] ✗ {file_info['name']} → {e}")

        return jsonify({
            "processed": len(results),
            "failed":    len(errors),
            "results":   results,
            "errors":    errors
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
from flask import Blueprint, jsonify

bp = Blueprint("ingestion", __name__)

@bp.route('/ingest/drive', methods=['POST'])
def ingest_from_drive():
    new_files = sync_drive_to_uploads()
    for path in new_files:
        process_pdf_task.delay(path)
    return jsonify({"queued": len(new_files), "files": new_files})
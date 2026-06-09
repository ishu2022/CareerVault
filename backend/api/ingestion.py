# api/ingestion.py  — production version
import threading
from flask import Blueprint, jsonify
from services.drive_services import sync_drive_to_uploads
from services.pipeline import run_pipeline

bp = Blueprint("ingestion", __name__)

# Simple in-memory job tracker (good enough for a college project)
# For production scale, use Redis or a proper task queue
_job_status = {"running": False, "last_result": None}


def _run_ingestion_job():
    """Runs in a background thread so the HTTP request returns immediately."""
    _job_status["running"] = True
    saved, skipped, failed = [], [], []
    try:
        files = sync_drive_to_uploads()
        for file_info in files:
            result = run_pipeline(
                pdf_path      = file_info["path"],
                original_name = file_info["name"],
                company_hint  = file_info.get("company_hint", "Unknown"),
                year_hint     = file_info.get("year_hint"),
            )
            if result.get("error"):
                failed.append({"file": file_info["name"], "error": result["error"]})
            elif result.get("skipped"):
                skipped.append(file_info["name"])
            else:
                saved.append(result)
    except Exception as e:
        _job_status["last_result"] = {"error": str(e)}
    finally:
        _job_status["running"]     = False
        _job_status["last_result"] = {
            "processed": len(saved),
            "skipped":   len(skipped),
            "failed":    len(failed),
            "errors":    failed,
        }


@bp.route("/ingest/drive", methods=["POST"])
def ingest_from_drive():
    """
    POST /api/v1/ingest/drive
    Starts the Drive → MongoDB ingestion in a background thread.
    Returns immediately with job started confirmation.
    Poll GET /api/v1/ingest/status to check progress.
    """
    if _job_status["running"]:
        return jsonify({"message": "Ingestion already running. Check /ingest/status"}), 409

    thread = threading.Thread(target=_run_ingestion_job, daemon=True)
    thread.start()

    return jsonify({"message": "Ingestion started in background. Poll /api/v1/ingest/status"}), 202


@bp.route("/ingest/status", methods=["GET"])
def ingestion_status():
    """
    GET /api/v1/ingest/status
    Returns current ingestion job status.
    """
    return jsonify({
        "running":     _job_status["running"],
        "last_result": _job_status["last_result"],
    })
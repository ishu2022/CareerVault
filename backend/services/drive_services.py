# services/drive_services.py

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

import io
import os
import re

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Must be defined BEFORE any function that uses it
SKIP_FOLDERS = [
    "Material", "Books", "Sample resume",
    "Study Material", "Mock Interview", "Interview Prep"
]

TARGET_YEARS = {"2023", "2024", "2025"}


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

def get_drive_service():
    service_account_file = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not service_account_file:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON missing from .env")
    creds = service_account.Credentials.from_service_account_file(
        service_account_file, scopes=SCOPES
    )
    return build('drive', 'v3', credentials=creds)


# ──────────────────────────────────────────────
# Drive walkers
# ──────────────────────────────────────────────

def list_subfolders(service, folder_id: str) -> list:
    query = (
        f"'{folder_id}' in parents "
        f"and mimeType='application/vnd.google-apps.folder' "
        f"and trashed=false"
    )
    results = service.files().list(
        q=query, fields="files(id, name)"
    ).execute()
    return results.get('files', [])


def list_pdfs_in_folder(service, folder_id: str) -> list:
    query = (
        f"'{folder_id}' in parents "
        f"and mimeType='application/pdf' "
        f"and trashed=false"
    )
    results = service.files().list(
        q=query, fields="files(id, name, modifiedTime)"
    ).execute()
    return results.get('files', [])


def list_all_pdfs_recursive(folder_id: str = None) -> list:
    """Recursively walks all subfolders and returns every PDF found."""
    folder_id = folder_id or os.getenv('DRIVE_FOLDER_ID')
    if not folder_id:
        raise ValueError("DRIVE_FOLDER_ID missing from .env")

    service  = get_drive_service()
    all_pdfs = []

    def walk(fid, path="root"):
        # PDFs directly in this folder
        for pdf in list_pdfs_in_folder(service, fid):
            pdf['folder_path'] = path
            all_pdfs.append(pdf)
            print(f"[drive] Found PDF: {path}/{pdf['name']}")

        # Recurse into sub-folders
        for subfolder in list_subfolders(service, fid):
            print(f"[drive] Entering folder: {subfolder['name']}")
            walk(subfolder['id'], path=f"{path}/{subfolder['name']}")

    walk(folder_id)
    print(f"[drive] Total PDFs found: {len(all_pdfs)}")
    return all_pdfs


# ──────────────────────────────────────────────
# Filtering helpers
# ──────────────────────────────────────────────

def is_relevant_pdf(folder_path: str) -> bool:
    """Return False for books, resumes, study material folders."""
    low = folder_path.lower()
    return not any(skip.lower() in low for skip in SKIP_FOLDERS)


def extract_year_from_path(folder_path: str):
    """Extract 2023/2024/2025 from path string."""
    for year in re.findall(r'\b20\d{2}\b', folder_path):
        if year in TARGET_YEARS:
            return year
    return None


def extract_company_from_path(folder_path: str) -> str:
    """
    Drive path structure:
      root / <year> Experiences / [Internship|FTE|Placements] / <Company> / file.pdf
    Company = rightmost segment that isn't a noise word or year.
    """
    parts = [p.strip() for p in folder_path.split('/') if p.strip()]
    noise = {
        'root', 'internship', 'internships', 'fte', 'placements',
        'placement', 'interview experiences', 'internship experiences'
    }
    for part in reversed(parts):
        low = part.lower()
        if low in noise:
            continue
        if re.fullmatch(r'20\d{2}.*', low):
            continue
        if 'experience' in low:
            continue
        return part
    return 'Unknown'


# ──────────────────────────────────────────────
# Download
# ──────────────────────────────────────────────

def download_pdf(file_id: str, dest_path: str):
    service = get_drive_service()
    request = service.files().get_media(fileId=file_id)
    with io.FileIO(dest_path, 'wb') as fh:
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
    print(f"[drive] Downloaded → {dest_path}")


# ──────────────────────────────────────────────
# Main sync — called by ingestion.py & ingest_all.py
# ──────────────────────────────────────────────

def sync_drive_to_uploads(upload_dir: str = None) -> list:
    """
    Downloads all 2023-2025 interview PDFs that are not yet in uploads/.
    Returns list of file info dicts for pipeline consumption.
    NOTE: Already-downloaded files are also returned so pipeline can
    apply the duplicate-guard (source_file check in MongoDB).
    """
    if upload_dir is None:
        base       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        upload_dir = os.path.join(base, 'uploads')

    os.makedirs(upload_dir, exist_ok=True)

    all_pdfs = list_all_pdfs_recursive()

    # Filter: only 2023-2025, no books/material
    interview_pdfs = [
        pdf for pdf in all_pdfs
        if is_relevant_pdf(pdf['folder_path'])
        and extract_year_from_path(pdf['folder_path']) in TARGET_YEARS
    ]

    print(f"[drive] {len(all_pdfs)} total → {len(interview_pdfs)} interview PDFs (2023–2025)")

    new_files = []
    for pdf in interview_pdfs:
        # Sanitise filename — colons & special chars crash Windows paths
        safe_name = re.sub(r'[\\/:*?"<>|]', '_', pdf['name'])
        dest      = os.path.join(upload_dir, safe_name)

        if not os.path.exists(dest):
            print(f"[drive] Downloading: {safe_name}")
            try:
                download_pdf(pdf['id'], dest)
            except Exception as e:
                print(f"[drive] ERROR downloading {safe_name}: {e}")
                continue
        else:
            print(f"[drive] Skipping (exists): {safe_name}")

        new_files.append({
            'path':         dest,
            'name':         safe_name,
            'company_hint': extract_company_from_path(pdf['folder_path']),
            'year_hint':    extract_year_from_path(pdf['folder_path']),
            'folder_path':  pdf['folder_path'],
        })

    return new_files
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

import io
import os
import re

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']



def is_relevant_pdf(folder_path: str) -> bool:
    """
    Keep only PDFs from:
    - 2023 Experiences
    - 2024 Experiences
    - 2025 Experiences
    """

    # Skip unwanted folders
    for skip in SKIP_FOLDERS:
        if skip.lower() in folder_path.lower():
            return False

    # Keep only 2023/2024/2025 folders
    allowed_year_folders = [
        "2023 Experiences",
        "2024 Experiences",
        "2025 Experiences"
    ]

    return any(year_folder in folder_path for year_folder in allowed_year_folders)
# Folders that should NOT be treated as interview experiences
SKIP_FOLDERS = [
    "Material",
    "Books",
    "Sample resume",
    "Study Material",
    "Mock Interview",
    "Interview Prep"
]


def get_drive_service():
    service_account_file = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')

    if not service_account_file:
        raise ValueError(
            "GOOGLE_SERVICE_ACCOUNT_JSON missing from environment"
        )

    creds = service_account.Credentials.from_service_account_file(
        service_account_file,
        scopes=SCOPES
    )

    return build('drive', 'v3', credentials=creds)


def list_subfolders(service, folder_id: str) -> list:
    query = (
        f"'{folder_id}' in parents "
        f"and mimeType='application/vnd.google-apps.folder' "
        f"and trashed=false"
    )

    results = service.files().list(
        q=query,
        fields="files(id, name)"
    ).execute()

    return results.get('files', [])


def list_pdfs_in_folder(service, folder_id: str) -> list:
    query = (
        f"'{folder_id}' in parents "
        f"and mimeType='application/pdf' "
        f"and trashed=false"
    )

    results = service.files().list(
        q=query,
        fields="files(id, name, modifiedTime)"
    ).execute()

    return results.get('files', [])


def list_all_pdfs_recursive(folder_id: str = None) -> list:
    folder_id = folder_id or os.getenv('DRIVE_FOLDER_ID')

    if not folder_id:
        raise ValueError("DRIVE_FOLDER_ID missing from environment")

    service = get_drive_service()

    all_pdfs = []

    def walk(fid, path="root"):
        pdfs = list_pdfs_in_folder(service, fid)

        for pdf in pdfs:
            pdf['folder_path'] = path
            all_pdfs.append(pdf)

            print(f"[drive] Found PDF: {path}/{pdf['name']}")

        subfolders = list_subfolders(service, fid)

        for subfolder in subfolders:
            print(f"[drive] Entering folder: {subfolder['name']}")

            walk(
                subfolder['id'],
                path=f"{path}/{subfolder['name']}"
            )

    walk(folder_id)

    print(
        f"[drive] Total PDFs found across all folders: {len(all_pdfs)}"
    )

    return all_pdfs


def list_pdfs(folder_id: str = None) -> list:
    return list_all_pdfs_recursive(folder_id)


def download_pdf(file_id: str, dest_path: str):
    service = get_drive_service()

    request = service.files().get_media(fileId=file_id)

    with io.FileIO(dest_path, 'wb') as fh:
        downloader = MediaIoBaseDownload(fh, request)

        done = False

        while not done:
            _, done = downloader.next_chunk()

    print(f"[drive] Downloaded -> {dest_path}")


# --------------------------------------------------
# Filtering helpers
# --------------------------------------------------

def is_relevant_pdf(folder_path: str) -> bool:
    """
    Skip books, resumes, study material folders.
    """
    for skip in SKIP_FOLDERS:
        if skip.lower() in folder_path.lower():
            return False

    return True


def extract_company_from_path(folder_path: str) -> str:
    """
    Example:

    root/2024 Experiences/Internship/Goldman Sachs
    -> Goldman Sachs
    """

    parts = [
        p.strip()
        for p in folder_path.split("/")
        if p.strip()
    ]

    ignore_words = [
        "experience",
        "experiences",
        "internship",
        "placement",
        "fte",
        "root"
    ]

    for part in reversed(parts):
        if not any(
            word in part.lower()
            for word in ignore_words
        ):
            if not part.isdigit():
                return part

    return "Unknown"


def extract_year_from_path(folder_path: str):
    matches = re.findall(r"\b20\d{2}\b", folder_path)

    for year in matches:
        if year in {"2023", "2024", "2025"}:
            return year

    return None

# --------------------------------------------------
# Main sync function
# --------------------------------------------------

def sync_drive_to_uploads(upload_dir: str = None) -> list:

    if upload_dir is None:
        base = os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )

        upload_dir = os.path.join(base, "uploads")

    os.makedirs(upload_dir, exist_ok=True)

    all_pdfs = list_all_pdfs_recursive()

    interview_pdfs = [
    pdf
    for pdf in all_pdfs
    if (
        is_relevant_pdf(pdf["folder_path"])
        and (
            "2023 Experiences" in pdf["folder_path"]
            or "2024 Experiences" in pdf["folder_path"]
            or "2025 Experiences" in pdf["folder_path"]
        )
    )
]
    print("\n===== FILTERED PDFS =====")
    for pdf in interview_pdfs[:20]:
        print(pdf["folder_path"])

    interview_pdfs.sort(
        key=lambda x: extract_year_from_path(x["folder_path"]) or "0",
        reverse=True
    )

    # Download only first 10 while testing
    interview_pdfs = interview_pdfs[:10]

    print(
        f"[drive] {len(all_pdfs)} total PDFs -> "
        f"{len(interview_pdfs)} interview PDFs after filtering"
    )

    new_files = []

    for pdf in interview_pdfs:

        dest = os.path.join(
            upload_dir,
            pdf["name"]
        )

        if not os.path.exists(dest):

            print(
                f"[drive] Downloading: {pdf['name']}"
            )

            download_pdf(
                pdf["id"],
                dest
            )

            new_files.append({
                "path": dest,
                "name": pdf["name"],
                "company_hint": extract_company_from_path(
                    pdf["folder_path"]
                ),
                "year_hint": extract_year_from_path(
                    pdf["folder_path"]
                ),
                "folder_path": pdf["folder_path"]
            })

        else:
            print(
                f"[drive] Skipping (exists): {pdf['name']}"
            )

    return new_files
# pip install google-api-python-client google-auth
# services/drive_service.py

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io, os

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
DRIVE_FOLDER_ID = os.getenv('DRIVE_FOLDER_ID')

def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build('drive', 'v3', credentials=creds)

def list_pdfs(folder_id: str = DRIVE_FOLDER_ID) -> list:
    """Returns list of {id, name, modifiedTime} for all PDFs in folder"""
    service = get_drive_service()
    query = f"'{folder_id}' in parents and mimeType='application/pdf' and trashed=false"
    results = service.files().list(
        q=query,
        fields="files(id, name, modifiedTime)"
    ).execute()
    return results.get('files', [])

def download_pdf(file_id: str, dest_path: str):
    """Downloads a Drive PDF to local disk"""
    service = get_drive_service()
    request = service.files().get_media(fileId=file_id)
    with io.FileIO(dest_path, 'wb') as fh:
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

def sync_drive_to_uploads(upload_dir: str = "uploads/") -> list:
    """Download all new PDFs from Drive, skip already downloaded"""
    pdfs = list_pdfs()
    new_files = []
    for pdf in pdfs:
        dest = os.path.join(upload_dir, pdf['name'])
        if not os.path.exists(dest):
            download_pdf(pdf['id'], dest)
            new_files.append(dest)
    return new_files  # return paths to process
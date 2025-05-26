import os
from django.conf import settings
import io

# Modo simulado quando não há credentials.json
SIMULATED_MODE = not os.path.exists(os.path.join(settings.BASE_DIR, 'solicitacoes_app', 'utils', 'credentials.json'))

if not SIMULATED_MODE:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseUpload
    
    SERVICE_ACCOUNT_FILE = os.path.join(settings.BASE_DIR, 'solicitacoes_app', 'utils', 'credentials.json')
    FOLDER_ID = '1RZBUMtSzTjKuzb8fbSn1_51MHVzFP7M8'
    SCOPES = ['https://www.googleapis.com/auth/drive']
    
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    drive_service = build('drive', 'v3', credentials=credentials)

def upload_to_drive(file_obj, file_name, mime_type):
    if SIMULATED_MODE:
        print(f"[SIMULAÇÃO] Arquivo '{file_name}' seria enviado ao Google Drive")
        return "fake_id", "https://example.com"
    else:
        file_io = io.BytesIO(file_obj.read())
        media = MediaIoBaseUpload(file_io, mimetype=mime_type)
        file_metadata = {
            'name': file_name,
            'parents': [FOLDER_ID]
        }
        file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        return file['id'], file['webViewLink']
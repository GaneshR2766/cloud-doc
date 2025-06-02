from flask import Flask, request, jsonify 
from flask_cors import CORS
from google.cloud import storage
from google.oauth2 import service_account, id_token
from google.auth.transport import requests as google_requests
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from mimetypes import guess_type
from datetime import timedelta
from functools import wraps
import os
import json

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = "service_account.json"
BUCKET_NAME = 'cloud-doc-bucket'

# Flask App Setup
app = Flask(__name__)
# Enable CORS only for your GitHub Pages frontend domain
CORS(app, origins=["https://ganeshr2766.github.io"])

# SQLite DB Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cloud_doc.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class SharedAccess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_email = db.Column(db.String(120), nullable=False)
    shared_with_email = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f"<SharedAccess {self.owner_email} -> {self.shared_with_email}>"

# Google Credentials Handling
def get_google_credentials():
    private_key = os.environ.get('GOOGLE_PRIVATE_KEY', '').replace('\\n', '\n')
    info = {
        "type": os.environ.get('GOOGLE_TYPE'),
        "project_id": os.environ.get('GOOGLE_PROJECT_ID'),
        "private_key_id": os.environ.get('GOOGLE_PRIVATE_KEY_ID'),
        "private_key": private_key,
        "client_email": os.environ.get('GOOGLE_CLIENT_EMAIL'),
        "client_id": os.environ.get('GOOGLE_CLIENT_ID'),
        "auth_uri": os.environ.get('GOOGLE_AUTH_URI'),
        "token_uri": os.environ.get('GOOGLE_TOKEN_URI'),
        "auth_provider_x509_cert_url": os.environ.get('GOOGLE_AUTH_PROVIDER_CERT_URL'),
        "client_x509_cert_url": os.environ.get('GOOGLE_CLIENT_CERT_URL'),
        "universe_domain": os.environ.get('GOOGLE_UNIVERSE_DOMAIN')
    }

    if not info["private_key"]:
        raise ValueError("Google private key is missing in environment variables")

    credentials = service_account.Credentials.from_service_account_info(info)
    return credentials

# Initialize Google Cloud Storage client and bucket
try:
    if os.path.exists(SERVICE_ACCOUNT_FILE):
        credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
    else:
        credentials = get_google_credentials()
except Exception as e:
    print(f"Failed to load credentials: {e}")
    raise

client = storage.Client(credentials=credentials, project=credentials.project_id)
bucket = client.bucket(BUCKET_NAME)

# Helper Functions
def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
        return idinfo.get('email')
    except Exception:
        return None

def get_user_folder(email):
    return f"{email.replace('@', '_at_').replace('.', '_dot_')}/"

def auth_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth_header.split(" ")[1]
        user_email = verify_google_token(token)
        if not user_email:
            return jsonify({'error': 'Invalid or expired token'}), 401
        request.user_email = user_email
        return func(*args, **kwargs)
    return wrapper

# Upload Endpoint
@app.route('/upload', methods=['POST'])
@auth_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    user_folder = get_user_folder(request.user_email)
    base_name, extension = os.path.splitext(filename)
    counter = 1
    new_filename = filename

    while bucket.blob(f"{user_folder}{new_filename}").exists():
        new_filename = f"{base_name}({counter}){extension}"
        counter += 1

    blob = bucket.blob(f"{user_folder}{new_filename}")
    file.seek(0)
    blob.upload_from_file(file)
    return jsonify({'message': f'File uploaded successfully as {new_filename}'})

# Preview File
@app.route('/preview/<path:filename>', methods=['GET'])
@auth_required
def preview_file(filename):
    user_folder = get_user_folder(request.user_email)
    blob = bucket.blob(f"{user_folder}{filename}")

    if not blob.exists():
        return jsonify({'error': 'File not found'}), 404

    try:
        mime_type, _ = guess_type(filename)
        disposition = 'inline' if mime_type in ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'] else 'attachment'

        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="GET",
            credentials=credentials,
            response_disposition=f'{disposition}; filename="{filename}"',
            response_type=mime_type or 'application/octet-stream'
        )
        return jsonify({'url': signed_url})
    except Exception as e:
        return jsonify({'error': f'Failed to generate preview link: {str(e)}'}), 500

# Download File
@app.route('/download/<path:filename>', methods=['GET'])
@auth_required
def download_file(filename):
    user_folder = get_user_folder(request.user_email)
    blob = bucket.blob(f"{user_folder}{filename}")

    if not blob.exists():
        return jsonify({'error': 'File not found'}), 404

    try:
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="GET",
            credentials=credentials
        )
        return jsonify({'url': signed_url})
    except Exception as e:
        return jsonify({'error': f'Failed to generate download link: {str(e)}'}), 500

# List Files (Personal + Shared)
@app.route('/files', methods=['GET'])
@auth_required
def list_files():
    try:
        files = []
        user_folder = get_user_folder(request.user_email)

        blobs = bucket.list_blobs(prefix=user_folder)
        for blob in blobs:
            signed_url = blob.generate_signed_url(
                version="v4", expiration=timedelta(minutes=15), method="GET", credentials=credentials
            )
            files.append({
                'name': blob.name.replace(user_folder, ''),
                'owner': request.user_email,
                'shared': False,
                'size': round(blob.size / 1024, 2),
                'modified': blob.updated.strftime('%Y-%m-%d %H:%M:%S'),
                'url': signed_url
            })

        shared_entries = SharedAccess.query.filter_by(shared_with_email=request.user_email).all()
        for entry in shared_entries:
            owner_folder = get_user_folder(entry.owner_email)
            blobs = bucket.list_blobs(prefix=owner_folder)
            for blob in blobs:
                signed_url = blob.generate_signed_url(
                    version="v4", expiration=timedelta(minutes=1440), method="GET", credentials=credentials
                )
                files.append({
                    'name': blob.name.replace(owner_folder, ''),
                    'owner': entry.owner_email,
                    'shared': True,
                    'size': round(blob.size / 1024, 2),
                    'modified': blob.updated.strftime('%Y-%m-%d %H:%M:%S'),
                    'url': signed_url
                })

        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

# Delete File
@app.route('/files/<path:filename>', methods=['DELETE'])
@auth_required
def delete_file(filename):
    user_folder = get_user_folder(request.user_email)
    blob = bucket.blob(f"{user_folder}{filename}")
    if not blob.exists():
        return jsonify({'error': 'File not found'}), 404

    try:
        blob.delete()
        return jsonify({'message': f'File {filename} deleted successfully'})
    except Exception as e:
        return jsonify({'error': f'Failed to delete file: {str(e)}'}), 500

# Share Folder
@app.route('/share-folder', methods=['POST'])
@auth_required
def share_folder():
    data = request.json
    shared_with_email = data.get('shared_with_email')

    if not shared_with_email:
        return jsonify({'error': 'Missing shared_with_email in request'}), 400
    if shared_with_email == request.user_email:
        return jsonify({'error': 'You cannot share with yourself'}), 400

    try:
        existing = SharedAccess.query.filter_by(owner_email=request.user_email, shared_with_email=shared_with_email).first()
        if existing:
            return jsonify({'message': 'Folder already shared with this user'}), 200

        entry = SharedAccess(owner_email=request.user_email, shared_with_email=shared_with_email)
        db.session.add(entry)
        db.session.commit()
        return jsonify({'message': f'Folder shared with {shared_with_email}'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to share folder: {str(e)}'}), 500

# Clear Shared Accesses
@app.route('/clear-shared-accesses', methods=['DELETE'])
@auth_required
def clear_shared_accesses():
    try:
        SharedAccess.query.filter_by(owner_email=request.user_email).delete()
        db.session.commit()
        return jsonify({'message': 'All shared accesses cleared'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to clear accesses: {str(e)}'}), 500

# Run App
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

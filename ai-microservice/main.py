# ai-microservice/main.py
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import boto3
import subprocess
import os
import requests
from dotenv import load_dotenv

app = FastAPI()

load_dotenv() 

app = FastAPI()

# AWS Setup 
s3 = boto3.client('s3', 
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)
BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
EXPRESS_WEBHOOK_URL = "http://localhost:3000/api/internal/recordings/update-clean"

# AWS Setup (Make sure these match your Express .env)
s3 = boto3.client('s3', 
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)
BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
EXPRESS_WEBHOOK_URL = "http://localhost:3000/api/internal/recordings/update-clean"

class RecordingEvent(BaseModel):
    recording_id: int
    raw_s3_key: str

class SessionProcessEvent(BaseModel):
    recordings: list[RecordingEvent]

def process_audio_task(recordings: list[RecordingEvent]):
    for rec in recordings:
        raw_key = rec.raw_s3_key
        filename = raw_key.split('/')[-1]
        
        # 3. Define the paths BEFORE the try block so they always exist
        local_raw_path = f"temp_{filename}"
        clean_local_path = None 
        
        try:
            # Add a quick debug print to verify variables loaded
            print(f"Downloading {raw_key} from bucket: {BUCKET_NAME}")
            
            # 1. Download raw file from S3
            s3.download_file(BUCKET_NAME, raw_key, local_raw_path)
            
            # 2. Run DeepFilterNet
            output_dir = "clean_output"
            os.makedirs(output_dir, exist_ok=True)
            subprocess.run(["deepFilter", local_raw_path, "-o", output_dir], check=True)
            
            # Now assign the clean path since it successfully generated
            clean_local_path = os.path.join(output_dir, filename)
            clean_s3_key = f"clean_recordings/clean_{filename}"
            
            # 3. Upload clean file back to S3
            s3.upload_file(
                clean_local_path, 
                BUCKET_NAME, 
                clean_s3_key,
                ExtraArgs={'ContentType': 'audio/wav'}
            )
            
            clean_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{clean_s3_key}"

            # 4. Notify Express that this recording is done
            requests.post(EXPRESS_WEBHOOK_URL, json={
                "recording_id": rec.recording_id,
                "clean_s3_key": clean_s3_key,
                "clean_url": clean_url
            })

        except Exception as e:
            print(f"Failed to process {rec.recording_id}: {e}")
        finally:
            # 4. Safely cleanup files
            if os.path.exists(local_raw_path): 
                os.remove(local_raw_path)
            # Only attempt to delete the clean file if the variable was assigned and exists
            if clean_local_path and os.path.exists(clean_local_path): 
                os.remove(clean_local_path)

                
@app.post("/process-session")
async def process_session(event: SessionProcessEvent, background_tasks: BackgroundTasks):
    # Add the heavy processing to a background thread so we return a 200 OK to Express instantly
    background_tasks.add_task(process_audio_task, event.recordings)
    return {"message": f"Processing {len(event.recordings)} files in the background"}
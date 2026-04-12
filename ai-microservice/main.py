import glob
import os
import subprocess
import requests
import boto3
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv() 

app = FastAPI()

# --- AWS Setup (Cleaned up duplicates) ---
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
        
        # Define the paths BEFORE the try block so they always exist
        local_raw_path = f"temp_{filename}"
        clean_local_path = None 
        
        try:
            print(f"Downloading {raw_key} from bucket: {BUCKET_NAME}")
            s3.download_file(BUCKET_NAME, raw_key, local_raw_path)
            
            output_dir = "clean_output"
            os.makedirs(output_dir, exist_ok=True)
            
            # 1. Run DeepFilterNet WITH THE AGGRESSIVE POST-FILTER (--pf)
            print("Applying DeepFilterNet with aggressive post-filtering...")
            subprocess.run(["deepFilter", local_raw_path, "-o", output_dir, "--pf","--atten-lim", "100"], check=True)
            
            # 2. Find the file it actually created
            base_temp_name = os.path.splitext(local_raw_path)[0] # removes .wav
            search_pattern = os.path.join(output_dir, f"{base_temp_name}*.wav")
            generated_files = glob.glob(search_pattern)

            if generated_files:
                actual_output_path = generated_files[0]
                clean_local_path = os.path.join(output_dir, filename) # The clean name we want
                
                # 3. Rename it so S3 gets a perfectly named file
                if actual_output_path != clean_local_path:
                    if os.path.exists(clean_local_path):
                        os.remove(clean_local_path)
                    os.rename(actual_output_path, clean_local_path)
            else:
                raise FileNotFoundError("Could not find the DeepFilterNet output file.")
            
            # 4. Upload clean file back to S3
            clean_s3_key = f"clean_recordings/clean_{filename}"
            print(f"Uploading clean audio to S3: {clean_s3_key}")
            
            s3.upload_file(
                clean_local_path, 
                BUCKET_NAME, 
                clean_s3_key,
                ExtraArgs={'ContentType': 'audio/wav'}
            )
            
            clean_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{clean_s3_key}"

            # 5. Notify Express that this recording is done
            requests.post(EXPRESS_WEBHOOK_URL, json={
                "recording_id": rec.recording_id,
                "clean_url": clean_url
            })
            
            print(f"✅ Successfully processed, renamed, and uploaded {filename}")

        except Exception as e:
            print(f"Failed to process {rec.recording_id}: {e}")
        finally:
            # 6. Safely cleanup local temp files
            if os.path.exists(local_raw_path): 
                os.remove(local_raw_path)
            if clean_local_path and os.path.exists(clean_local_path): 
                os.remove(clean_local_path)

@app.post("/process-session")
async def process_session(event: SessionProcessEvent, background_tasks: BackgroundTasks):
    # Add the heavy processing to a background thread so we return a 200 OK to Express instantly
    background_tasks.add_task(process_audio_task, event.recordings)
    return {"message": f"Processing {len(event.recordings)} files in the background"}
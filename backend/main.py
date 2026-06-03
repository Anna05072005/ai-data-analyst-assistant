from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from app.analyzer import analyze_dataset

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def root():
    return {"message": "AI Data Analyst Assistant backend is running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename

    if not filename.endswith((".csv", ".xlsx")):
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported"
        )

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        return analyze_dataset(file_path, filename)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)

        return {
            "filename": file.filename,
            "columns": list(df.columns),
            "rows": len(df),
            "preview": df.head().to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
from fastapi import FastAPI, File, UploadFile
from app.services.mri_service import MRIService
import os

app = FastAPI(title = "BioHealth AI Core Platform")

MODEL_PATH = "app/models/mri_model.keras" 
mri_service = MRIService(MODEL_PATH)

@app.get("/")
def read_root():
    return {"message": "Welcome to BioHealth AI Core Platform!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "services": ["mri"]}

@app.post("/api/mri/analyze")
async def analyze_mri(file: UploadFile = File(...)):
    #kullanıcının gönderdiği fotoğrafı bytes olarak okur
    image_bytes = await file.read()
    
    result = mri_service.predict(image_bytes)
    
    return {
        "filename": file.filename,
        "analysis": result
    }

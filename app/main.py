from fastapi import FastAPI, File, UploadFile
from app.services.mri_service import MRIService
from app.services.nlp_service import NLPService
import os

app = FastAPI(title = "BioHealth AI Core Platform")

MODEL_PATH = "app/models/mri_model.keras" 
mri_service = MRIService(MODEL_PATH)
nlp_service = NLPService()

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

@app.post("/api/nlp/analyze")
async def analyze_medical_text(text: str):
    result = nlp_service.analyze_text(text)
    return {
        "text_analyzed": text,
        "entities": result
    }
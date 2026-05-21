from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.services.mri_service import MRIService
from app.services.nlp_service import NLPService
import os
from app.core.database import engine, get_db
from app.models import db_models
from sqlalchemy.orm import Session

# db_models içinde tanımlanan tabloları veritabanında oluşturur
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title = "BioHealth AI Core Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Web arayüzümüzün tarayıcı engelini tamamen kaldırır
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def analyze_mri(file: UploadFile = File(...), db: Session = Depends(get_db)):
    #kullanıcının gönderdiği fotoğrafı bytes olarak okur
    image_bytes = await file.read()
    result = mri_service.predict(image_bytes)

    # VERİTABANINA KAYIT KISMI
    new_record = db_models.AnalysisResult(
        filename=file.filename,
        analysis_type="MRI",
        prediction=result['prediction'],
        confidence=result['confidence']
    )
    db.add(new_record)
    db.commit()
    
    return {
        "filename": file.filename,
        "analysis": result
    }

@app.post("/api/nlp/analyze")
async def analyze_medical_text(text: str, db: Session = Depends(get_db)):
    result = nlp_service.analyze_text(text)
    
    # Karmaşık entity listesini veritabanında okunabilir temiz bir özete çevirelim
    if isinstance(result, list) and len(result) > 0:
        found_entities = ", ".join([f"{item.get('word', item.get('entity'))} ({item.get('entity_group', 'Terim')})" for item in result])
        prediction_text = f"Tespit Edilen Tıbbi Varlıklar: {found_entities}"
    else:
        prediction_text = "Herhangi bir tıbbi varlık tespit edilemedi."

    # Doktorun analiz ettiği metnin ilk 30 karakterini "filename" yerine başlık gibi koyalım
    # Böylece geçmiş listesinde hangi metin olduğunu anlar
    text_preview = text if len(text) <= 30 else text[:27] + "..."
    
    db_analysis = db_models.AnalysisResult(
        filename=f"Metin: {text_preview}",
        prediction=prediction_text,
        confidence=1.0
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return {
        "id": db_analysis.id,
        "text_analyzed": text,
        "entities": result,
        "db_status": "Başarıyla Veritabanına Mühürlendi"
    }

@app.get("/api/analysis/history")
def get_analysis_history(db: Session = Depends(get_db)):
    # Veritabanındaki tüm kayıtları çekip listeler
    history = db.query(db_models.AnalysisResult).all()
    return history
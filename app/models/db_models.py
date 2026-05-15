from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base
import datetime

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)  # Yüklenen dosya adı
    analysis_type = Column(String)  
    prediction = Column(String)  
    confidence = Column(Float, nullable=True)  # accuracy
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
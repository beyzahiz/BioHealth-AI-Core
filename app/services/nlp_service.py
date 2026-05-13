from transformers import pipeline

class NLPService:
    def __init__(self):
        # BioBERT tabanlı NER modeli
        print("--- [LOG] Bio-NLP Modeli yükleniyor... ---")
        self.ner_pipeline = pipeline(
            "ner", 
            model="d4data/biomedical-ner-all", 
            aggregation_strategy="first"
        )
        print("--- [BAŞARI] Bio-NLP Modeli hazır! ---")

    def analyze_text(self, text: str):
        entities = self.ner_pipeline(text)
        
        results = []
        for ent in entities:
            results.append({
                "entity": ent["word"],
                "label": ent["entity_group"],
                "score": round(float(ent["score"]), 4)
            })
        return results
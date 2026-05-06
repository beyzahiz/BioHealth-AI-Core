from fastapi import FastAPI

app = FastAPI(title = "BioHealth AI Core Platform")

@app.get("/")
def read_root():
    return {"message": "Welcome to BioHealth AI Core Platform!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "services": ["mri", "nlp"]}


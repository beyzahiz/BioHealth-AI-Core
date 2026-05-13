import tensorflow as tf
import numpy as np
from PIL import Image
import io

class MRIService:
    def __init__(self, model_path: str):
        self.model = tf.keras.models.load_model(model_path)
        self.classes = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary']

    def predict (self, image_bytes):
        #preprocessing
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224)) 
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        #prediction
        predictions = self.model.predict(img_array)
        class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))

        return {
            'prediction': self.classes[class_idx],
            'confidence': round(confidence, 4)
        }

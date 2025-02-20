import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Load the pre-trained model
model = load_model('path_to_model.h5')  # Ensure this path is correct

def preprocess_image(image):
    # Resize image to match model input size, convert to grayscale, normalize
    resized = cv2.resize(image, (48, 48))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    normalized = gray / 255.0
    return normalized.reshape(-1, 48, 48, 1)

def emotion_predict(frame):
    processed = preprocess_image(frame)
    prediction = model.predict(processed)
    emotion = np.argmax(prediction)
    emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    return emotions[emotion]

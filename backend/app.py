from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import os

app = Flask(__name__)

# Load pre-trained model for facial emotion recognition
model = load_model('emotion_model.h5')  # Ensure this model is in the same directory
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Helper function for emotion recognition
def predict_emotion(face_image):
    gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (48, 48))  # FER2013 dataset uses 48x48
    img_array = img_to_array(resized) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    predictions = model.predict(img_array)
    emotion = emotion_labels[np.argmax(predictions)]
    return emotion

# Route to handle image upload
@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file:
        image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        emotion = predict_emotion(image)
        return jsonify({"emotion": emotion})
    return jsonify({"error": "Invalid file"}), 400

# Route to handle live video feed
def generate_frames():
    cap = cv2.VideoCapture(0)  # Use default camera
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        face_emotion = predict_emotion(frame)
        cv2.putText(frame, face_emotion, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)

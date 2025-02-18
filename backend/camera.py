import cv2
from tensorflow.keras.models import model_from_json
from tensorflow.keras.models import Sequential  # Ensure Sequential is recognized
import numpy as np

# Load the face detector
facec = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

class FacialExpressionModel:
    def __init__(self, model_json_path, model_weights_path):
        # Load the model architecture from the JSON file
        with open(model_json_path, 'r') as json_file:
            loaded_model_json = json_file.read()
            self.loaded_model = model_from_json(loaded_model_json)

        # Load the model weights from the .h5 file
        self.loaded_model.load_weights(model_weights_path)

    def predict_emotion(self, roi):
        # Preprocess the ROI (region of interest) for prediction
        roi = roi.astype('float32') / 255.0
        roi = np.expand_dims(roi, axis=-1)  # Add channel dimension if necessary
        prediction = self.loaded_model.predict(np.expand_dims(roi, axis=0))
        return prediction

class VideoCamera(object):
    def __init__(self):
        # Open a video stream or use a video file
        self.video = cv2.VideoCapture('D:\\main\\My works\\Project\\Emotion Facial Recognition\\Project\\videos\\tony.mp4')

    def __del__(self):
        # Release the video capture when done
        self.video.release()

    def get_frame(self):
        # Capture frame from the video
        _, fr = self.video.read()
        if fr is None:
            return None
        
        # Convert the frame to grayscale for face detection
        gray_fr = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the frame
        faces = facec.detectMultiScale(gray_fr, 1.3, 5)

        for (x, y, w, h) in faces:
            # Get the region of interest (face region)
            fc = gray_fr[y:y+h, x:x+w]

            # Resize the face image to match the input size of the model (48x48)
            roi = cv2.resize(fc, (48, 48))

            # Predict emotion for the face region
            model = FacialExpressionModel("model_anson.json", "model_weights.h5")
            pred = model.predict_emotion(roi)

            # Display the predicted emotion text
            emotion = np.argmax(pred)  # Assuming model returns a vector of emotion scores
            cv2.putText(fr, str(emotion), (x, y), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
            cv2.rectangle(fr, (x, y), (x+w, y+h), (255, 0, 0), 2)

        # Convert the frame to jpeg format for returning
        _, jpeg = cv2.imencode('.jpg', fr)
        return jpeg.tobytes()

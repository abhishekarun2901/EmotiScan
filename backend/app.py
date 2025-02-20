from flask import Flask, request, jsonify
import cv2
from model import emotion_predict

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    image = request.files['image'].read()
    npimg = np.frombuffer(image, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    result = emotion_predict(frame)
    return jsonify({'emotion': result})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

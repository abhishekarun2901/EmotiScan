
# EmotiScan: Web-based Facial Emotion Recognition System Integrating XAI
EmotiScan is a web-based application built to provide real-time emotion detection through facial expressions, aimed primarily at assisting individuals with autism, alexithymia, or anyone who faces difficulty recognizing emotions. By integrating Convolutional Neural Networks (CNNs) with Explainable AI (Grad-CAM), EmotiScan allows users to understand why certain emotions are detected, enhancing transparency and trust in the system.


# 🚀 Features
✅ Real-Time Emotion Detection – Detects emotions from images or webcam input  

✅ Explainability with Grad-CAM – Highlights facial regions influencing the decision 

✅ User-Friendly Web Interface – Built with React.js for accessibility  

✅ Multi-Language Support – Expands accessibility for a global audience  

✅ Therapist Collaboration Tools – Helps in tracking emotional patterns over time  


# ⚙️ Installation & Setup
## 1️⃣ Clone the Repository
```
git clone https://github.com/your-username/EmotiScan.git
cd EmotiScan
```
## 2️⃣ Backend Setup (Flask)  
### Install Dependencies  
```
cd backend
pip install -r requirements.txt
```
### Run the Backend Server
```
python app.py
```
## 3️⃣ Frontend Setup (React.js)  
### Install Dependencies  
```
cd frontend
npm install
```
### Run the Frontend  
```
npm start
```
# 🖼️ How It Works
1. User uploads an image or uses a webcam.  
2. System detects facial emotions using a CNN model.  
3. Grad-CAM highlights important facial regions influencing the prediction.  
4. Results are displayed with emotion labels and confidence scores.     
## 🧪 Running Tests
### To run backend unit tests:  
```cd backend
pytest tests/
```
### To run frontend tests:
```cd frontend
npm test
```
# 📌 Future Improvements
✅ Support for more emotions beyond FER2013’s seven categories  
✅ Integration with wearable devices for emotion tracking  
✅ Personalized emotion analytics for long-term behavior analysis 

# 🤝 Contributing
1. Fork the repository  
2. Create a new branch (feature-xyz)  
3. Commit changes (git commit -m "Add new feature")  
4. Push to GitHub (git push origin feature-xyz)  
5. Submit a Pull Request  

# 📜 License
This project is licensed under the MIT License – see LICENSE for details.  

## 🚀 *Star this repo if you find it useful!* ⭐





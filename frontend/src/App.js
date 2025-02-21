import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ResultsPage from "./ResultsPage";

const App = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [permission, setPermission] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [useWebcam, setUseWebcam] = useState(true);

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermission(true);
    } catch (error) {
      alert("Webcam access denied. Please allow webcam access.");
    }
  };

  const captureImage = () => {
    if (!permission) {
      alert("Please allow webcam access first!");
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setCaptured(true);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setCaptured(true);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="container">
            <h1 className="title">EmotiScan</h1>

            <div className="toggle-box">
              <button 
                className={`toggle-btn ${useWebcam ? "active" : ""}`} 
                onClick={() => setUseWebcam(true)}
              >Use Webcam</button>
              <button 
                className={`toggle-btn ${!useWebcam ? "active" : ""}`} 
                onClick={() => setUseWebcam(false)}
              >Upload Image</button>
            </div>

            {useWebcam ? (
              <>
                {!permission ? (
                  <button className="btn request-btn" onClick={requestPermission}>
                    Allow Webcam Access
                  </button>
                ) : (
                  <div className="box">
                    <Webcam ref={webcamRef} className="webcam" screenshotFormat="image/png" />
                    <button className="btn start-btn" onClick={captureImage}>
                      Capture Image
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="box">
                <input type="file" accept="image/*" className="file-input" onChange={handleUpload} />
              </div>
            )}

            {captured && (
              <Link to="/results" state={{ image, uploadedImage }} className="btn results-btn">
                View Emotion Analysis →
              </Link>
            )}
          </div>
        }/>

        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
};

export default App;

import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, Upload, RefreshCw, ChevronLeft } from "lucide-react";

const Home = ({ setEmotionData }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const navigate = useNavigate();

  const capture = async () => {
    setIsCapturing(true);
    try {
      const imgSrc = webcamRef.current.getScreenshot();
      setImage(imgSrc);
      await sendImageToBackend(imgSrc, true);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await sendImageToBackend(selectedFile, false);
  };

  const sendImageToBackend = async (imageData, isBase64) => {
    try {
      let formData = new FormData();
      if (isBase64) {
        const blob = await fetch(imageData).then((res) => res.blob());
        formData.append("file", blob, "webcam.jpg");
      } else {
        formData.append("file", imageData);
      }

      // Simulated backend response
      const fakeResponse = {
        emotions: {
          happy: 0.12,
          neutral: 0.25,
          angry: 0.05,
          disgust: 0.08,
          sorrow: 0.10,
          fear: 0.20,
          surprise: 0.20,
        },
      };

      const highestEmotion = Object.keys(fakeResponse.emotions).reduce((a, b) =>
        fakeResponse.emotions[a] > fakeResponse.emotions[b] ? a : b
      );

      setEmotionData({
        detectedEmotion: highestEmotion,
        scores: fakeResponse.emotions,
      });

      navigate("/results");
    } catch (error) {
      console.error("Error detecting emotion:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          EmotiScan
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Webcam Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Capture via Webcam</h2>
            <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={capture}
              disabled={isCapturing}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Camera size={20} />
              {isCapturing ? "Processing..." : "Capture & Analyze"}
            </button>
          </div>

          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
            <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden bg-gray-800/50 flex items-center justify-center">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-50">Preview will appear here</p>
                </div>
              )}
            </div>
            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-2 justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer">
                <Upload size={20} />
                Choose File
              </div>
            </label>
            {selectedFile && (
              <button
                onClick={handleUpload}
                className="mt-3 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors w-full justify-center"
              >
                Analyze Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Results = ({ emotionData }) => {
  const navigate = useNavigate();
  
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: "bg-yellow-400",
      neutral: "bg-gray-400",
      angry: "bg-red-500",
      disgust: "bg-green-500",
      sorrow: "bg-blue-500",
      fear: "bg-purple-500",
      surprise: "bg-pink-500"
    };
    return colors[emotion] || "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Analysis Results
          </h1>
        </div>

        {emotionData ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold mb-2">Primary Emotion</h2>
              <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${getEmotionColor(emotionData.detectedEmotion)}`}>
                {emotionData.detectedEmotion.toUpperCase()}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Emotion Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(emotionData.scores).map(([emotion, score]) => (
                  <div key={emotion} className="relative">
                    <div className="flex justify-between mb-1">
                      <span className="capitalize">{emotion}</span>
                      <span>{Math.round(score * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getEmotionColor(emotion)} transition-all duration-500`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mx-auto"
            >
              <RefreshCw size={20} />
              Analyze Another Image
            </button>
          </div>
        ) : (
          <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-xl">
            <p>No results available. Please analyze an image first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [emotionData, setEmotionData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setEmotionData={setEmotionData} />} />
        <Route path="/results" element={<Results emotionData={emotionData} />} />
      </Routes>
    </Router>
  );
};

export default App;
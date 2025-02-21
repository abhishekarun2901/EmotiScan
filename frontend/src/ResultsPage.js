import React from "react";
import { useLocation, Link } from "react-router-dom";

const ResultsPage = () => {
  const location = useLocation();
  const { image, uploadedImage } = location.state || {};

  const emotions = [
    { name: "Happy", score: (Math.random() * 100).toFixed(2) },
    { name: "Sad", score: (Math.random() * 100).toFixed(2) },
    { name: "Angry", score: (Math.random() * 100).toFixed(2) },
    { name: "Surprised", score: (Math.random() * 100).toFixed(2) },
    { name: "Fearful", score: (Math.random() * 100).toFixed(2) },
    { name: "Disgusted", score: (Math.random() * 100).toFixed(2) },
    { name: "Neutral", score: (Math.random() * 100).toFixed(2) },
  ];

  return (
    <div className="container">
      <h1 className="title">Emotion Analysis</h1>

      {image && (
        <div className="results-box">
          <p>Captured Image:</p>
          <img src={image} alt="Captured" className="preview" />
        </div>
      )}

      {uploadedImage && (
        <div className="results-box">
          <p>Uploaded Image:</p>
          <img src={uploadedImage} alt="Uploaded" className="preview" />
        </div>
      )}

      <div className="results-box">
        <h2>Detected Emotions & Scores:</h2>
        {emotions.map((emotion, index) => (
          <div key={index} className="emotion-container">
            <p className="emotion-name">{emotion.name}</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${emotion.score}%` }}>
                {emotion.score}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/" className="btn home-btn">← Back to Home</Link>
    </div>
  );
};

export default ResultsPage;

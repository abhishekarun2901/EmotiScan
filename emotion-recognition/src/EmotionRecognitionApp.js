import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import logo from './logo.svg';

import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { drawMesh } from "./utilities";

function EmotionRecognitionApp() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const blazeface = require('@tensorflow-models/blazeface')
  const [uploadedImage, setUploadedImage] = useState(null);
  const [gradcamImage, setGradcamImage] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [detectedEmotion, setDetectedEmotion] = useState("Neutral");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load blazeface model
  const runFaceDetectorModel = async () => {
    const model = await blazeface.load()
    console.log("FaceDetection Model is Loaded..")
    setInterval(() => {
      detect(model);
    }, 1000); // Reduced frequency to once per second to avoid overwhelming the server
  }

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setGradcamImage(null);  // Clear previous GradCAM when new image is uploaded
        setShowExplanation(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle explanation view
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const detect = async (net) => {
    // If already processing, skip this cycle
    if (isProcessing) return;
    
    let imageToDetect;
    let videoWidth, videoHeight;

    // Determine whether to use webcam or uploaded image
    if (uploadedImage) {
      const img = new Image();
      img.src = uploadedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      imageToDetect = img;
      videoWidth = img.width;
      videoHeight = img.height;
    } else if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties from Webcam
      const video = webcamRef.current.video;
      videoWidth = webcamRef.current.video.videoWidth;
      videoHeight = webcamRef.current.video.videoHeight;
      imageToDetect = video;
    } else {
      return; // No image or video to detect
    }

    // Set canvas width and height
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Make Detections
    try {
      setIsProcessing(true);
      const face = await net.estimateFaces(imageToDetect);

      // Websocket communication
      const socket = new WebSocket('ws://localhost:8000');
      const imageSrc = uploadedImage || webcamRef.current.getScreenshot();
      const apiCall = {
        event: "localhost:subscribe",
        data: { 
          image: imageSrc
        },
      };
      
      // Set a timeout for the WebSocket connection
      const socketTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          console.log("⚠️ WebSocket connection timeout");
          socket.close();
          setIsProcessing(false);
        }
      }, 5000);
      
      socket.onopen = () => {
        clearTimeout(socketTimeout);
        socket.send(JSON.stringify(apiCall));
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsProcessing(false);
      };
      
      socket.onmessage = function(event) {
        try {
          const pred_log = JSON.parse(event.data);
          
          if (pred_log.error) {
            console.error("Server error:", pred_log.error);
            setIsProcessing(false);
            return;
          }
          
          // Update emotion bars
          if (pred_log.predictions) {
            document.getElementById("Angry").value = Math.round(pred_log.predictions.angry * 100);
            document.getElementById("Neutral").value = Math.round(pred_log.predictions.neutral * 100);
            document.getElementById("Happy").value = Math.round(pred_log.predictions.happy * 100);
            document.getElementById("Fear").value = Math.round(pred_log.predictions.fear * 100);
            document.getElementById("Surprise").value = Math.round(pred_log.predictions.surprise * 100);
            document.getElementById("Sad").value = Math.round(pred_log.predictions.sad * 100);
            document.getElementById("Disgust").value = Math.round(pred_log.predictions.disgust * 100);
          }

          // Update detected emotion
          if (pred_log.emotion) {
            // Capitalize first letter for display
            const formattedEmotion = pred_log.emotion.charAt(0).toUpperCase() + pred_log.emotion.slice(1);
            setDetectedEmotion(formattedEmotion);
            
            // Also update the text input since it might be used elsewhere
            const emotionTextElement = document.getElementById("emotion_text");
            if (emotionTextElement) {
              emotionTextElement.value = formattedEmotion;
            }
          }

          // Store GradCAM data if available
          if (pred_log.gradcam && pred_log.gradcam.superimposed) {
            setGradcamImage(pred_log.gradcam.superimposed);
            setExplanationText(pred_log.gradcam.explainability);
            
            // Automatically show explanation when image is uploaded
            if (uploadedImage && !showExplanation) {
              setShowExplanation(true);
            }
          }

          // Get canvas context
          const ctx = canvasRef.current.getContext("2d");
          
          // Draw uploaded image or video frame
          if (uploadedImage && !showExplanation) {
            const img = new Image();
            img.src = uploadedImage;
            ctx.drawImage(img, 0, 0, videoWidth, videoHeight);
          }

          requestAnimationFrame(() => {
            drawMesh(face, pred_log, ctx);
          });
          
          setIsProcessing(false);
        } catch (error) {
          console.error("Error processing message:", error);
          setIsProcessing(false);
        }
      };
      
      socket.onclose = () => {
        setIsProcessing(false);
      };
    } catch (error) {
      console.error("Detection error:", error);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    runFaceDetectorModel();
  }, [uploadedImage]);

  return (
    <div className="App">
      {/* Webcam Component */}
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 600,
          top:20,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
          display: uploadedImage ? 'none' : 'block'
        }}
      />

      {/* Canvas for Drawing */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 600,
          top:20,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />

      {/* Uploaded Image Display */}
      {uploadedImage && !showExplanation && (
        <img 
          src={uploadedImage} 
          alt="Uploaded" 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 600,
            top:20,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            objectFit: 'cover'
          }}
        />
      )}

      {/* GradCAM Visualization */}
      {showExplanation && gradcamImage && (
        <div style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 600,
          top:20,
          textAlign: "center",
          zindex: 10,
          width: 640,
          height: 530,
        }}>
          <img 
            src={gradcamImage} 
            alt="GradCAM Visualization" 
            style={{
              width: 640,
              height: 480,
              objectFit: 'cover'
            }}
          />
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '5px',
          }}>
            {explanationText}
          </div>
        </div>
      )}

      {/* Toggle Explanation Button */}
      {gradcamImage && (
        <button 
          onClick={toggleExplanation}
          style={{
            position: "absolute",
            bottom: 10,
            left: 300,
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {showExplanation ? "Show Original Image" : "Show Explanation"}
        </button>
      )}

      {/* Image Upload Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
        }}
      />

      {/* Clear Image Button */}
      {uploadedImage && (
        <button 
          onClick={() => {
            setUploadedImage(null);
            setGradcamImage(null);
            setShowExplanation(false);
            setDetectedEmotion("Neutral");
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          style={{
            position: "absolute",
            bottom: 10,
            left: 200,
          }}
        >
          Clear Image
        </button>
      )}

      <header className="App-header">
        <img src={logo} 
          className="App-logo" 
          alt="logo"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            bottom:10,
            left: 0,
            right: 0,
            width: 150,
            height: 150,
          }}
        />   
        <div className="Prediction" style={{
          position:"absolute",
          right:100,
          width:500,
          top: 60
        }}>
          <label htmlFor="Angry" style={{color:'red'}}>Angry </label>
          <progress id="Angry" value="0" max="100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Neutral" style={{color:'lightgreen'}}>Neutral </label>
          <progress id="Neutral" value="0" max="100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Happy" style={{color:'orange'}}>Happy </label>
          <progress id="Happy" value="0" max="100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Fear" style={{color:'lightblue'}}>Fear </label>
          <progress id="Fear" value="0" max="100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Surprise" style={{color:'yellow'}}>Surprised </label>
          <progress id="Surprise" value="0" max="100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Sad" style={{color:'gray'}}>Sad </label>
          <progress id="Sad" value="0" max="100">10%</progress>
          <br></br>
          <br></br>
          <label htmlFor="Disgust" style={{color:'pink'}}>Disgusted </label>
          <progress id="Disgust" value="0" max="100">10%</progress>
        </div>
        <input 
          id="emotion_text" 
          name="emotion_text" 
          value={detectedEmotion}
          readOnly
          style={{
            position:"absolute",
            width:200,
            height:50,
            bottom:60,
            left:300,
            fontSize: "30px",
          }}
        />
      </header>
    </div>
  );
}

export default EmotionRecognitionApp;
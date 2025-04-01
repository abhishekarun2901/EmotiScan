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

  // Load blazeface model
  const runFaceDetectorModel = async () => {
    const model = await blazeface.load()
    console.log("FaceDetection Model is Loaded..")
    setInterval(() => {
      detect(model);
    }, 100);
  }

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const detect = async (net) => {
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
    const face = await net.estimateFaces(imageToDetect);

    // Websocket communication
    var socket = new WebSocket('ws://localhost:8000')
    var imageSrc = uploadedImage || webcamRef.current.getScreenshot();
    var apiCall = {
      event: "localhost:subscribe",
      data: { 
        image: imageSrc
      },
    };
    socket.onopen = () => socket.send(JSON.stringify(apiCall))
    socket.onmessage = function(event) {
      var pred_log = JSON.parse(event.data)
      document.getElementById("Angry").value = Math.round(pred_log['predictions']['angry']*100)
      document.getElementById("Neutral").value = Math.round(pred_log['predictions']['neutral']*100)
      document.getElementById("Happy").value = Math.round(pred_log['predictions']['happy']*100)
      document.getElementById("Fear").value = Math.round(pred_log['predictions']['fear']*100)
      document.getElementById("Surprise").value = Math.round(pred_log['predictions']['surprise']*100)
      document.getElementById("Sad").value = Math.round(pred_log['predictions']['sad']*100)
      document.getElementById("Disgust").value = Math.round(pred_log['predictions']['disgust']*100)

      document.getElementById("emotion_text").value = pred_log['emotion']

      // Get canvas context
      const ctx = canvasRef.current.getContext("2d");
      
      // Draw uploaded image or video frame
      if (uploadedImage) {
        const img = new Image();
        img.src = uploadedImage;
        ctx.drawImage(img, 0, 0, videoWidth, videoHeight);
      }

      requestAnimationFrame(()=>{drawMesh(face, pred_log, ctx)});
    }
  };

  useEffect(()=>{runFaceDetectorModel()}, [uploadedImage]);

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
      {uploadedImage && (
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
          <label forhtml="Angry" style={{color:'red'}}>Angry </label>
          <progress id="Angry" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label forhtml="Neutral" style={{color:'lightgreen'}}>Neutral </label>
          <progress id="Neutral" value="0" max = "100">10%</progress>
          <br></br>
          <br></br>
          <label forhtml="Happy" style={{color:'orange'}}>Happy </label>
          <progress id="Happy" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label forhtml="Fear" style={{color:'lightblue'}}>Fear </label>
          <progress id="Fear" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label forhtml="Surprise" style={{color:'yellow'}}>Surprised </label>
          <progress id="Surprise" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label forhtml="Sad" style={{color:'gray'}} >Sad </label>
          <progress id="Sad" value="0" max = "100" >10%</progress>
          <br></br>
          <br></br>
          <label forhtml="Disgust" style={{color:'pink'}} >Disgusted </label>
          <progress id="Disgust" value="0" max = "100" >10%</progress>
        </div>
        <input 
          id="emotion_text" 
          name="emotion_text" 
          value="Neutral"
          readOnly
          style={{
            position:"absolute",
            width:200,
            height:50,
            bottom:60,
            left:300,
            "font-size": "30px",
          }}
        ></input>
      </header>
    </div>
  );
}

export default EmotionRecognitionApp;

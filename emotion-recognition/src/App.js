import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import EmotionRecognitionApp from './EmotionRecognitionApp'; // Updated import name

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<EmotionRecognitionApp />} />
      </Routes>
    </Router>
  );
}

export default App;
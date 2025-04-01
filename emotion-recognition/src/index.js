import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' for React 18
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root')); // Corrected for React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from './wireframe-face.jpg'; // Ensure it's the high-res version

function HomePage() {
  return (
    <div 
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6, // Increase visibility
          filter: 'none', // Remove blur
        }}
      />

      {/* Content Overlay */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          color: '#fff',
          padding: '20px',
          maxWidth: '800px',
        }}
      >
        <h1 
          style={{
            fontSize: '3.5rem',
            marginBottom: '20px',
            fontWeight: 'bold',
            textShadow: '0 0 15px rgba(33, 150, 243, 0.9)',
          }}
        >
          EMOTISCAN
        </h1>

        <p 
          style={{
            fontSize: '1.2rem',
            marginBottom: '30px',
            color: '#ccc',
            maxWidth: '600px',
            margin: '0 auto 30px',
            lineHeight: '1.6',
          }}
        >
         "EmotiScan is an AI-powered facial emotion recognition system that aids children with autism in understanding emotions, using deep learning for real-time analysis in therapy and education."
        </p>

        <Link 
          to="/demo"
          style={{
            display: 'inline-block',
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '12px 30px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px rgba(33, 150, 243, 0.5)',
            border: '2px solid rgba(33, 150, 243, 0.7)',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 0 25px rgba(33, 150, 243, 0.7)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 0 15px rgba(33, 150, 243, 0.5)';
          }}
        >
          Try Demo
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
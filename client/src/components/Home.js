import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{
      textAlign: 'center',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Advanced PDF Editor
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
        Edit, convert, and encrypt PDF files with military-grade security
      </p>
      <Link to="/editor" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}>
        ✏️ Start Editing
      </Link>
    </div>
  );
};

export default Home;
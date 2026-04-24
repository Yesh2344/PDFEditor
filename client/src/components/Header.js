import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{
      background: 'rgba(255,255,255,0.1)',
      padding: '1rem 2rem',
      borderBottom: '1px solid rgba(255,255,255,0.2)'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          🔒 Encrypted PDF Editor
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
// Updated - v7.6.1
          <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' }}>
            Home
          </Link>
          <Link to="/editor" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' }}>
            Editor
          </Link>
# Added comment
        </div>
      </nav>
# Added comment
    </header>
  );
};

export default Header;
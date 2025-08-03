import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  };

  const contentStyle = {
    maxWidth: '800px',
    width: '100%',
    textAlign: 'center',
    color: 'white'
  };

  const headerStyle = {
    marginBottom: '60px'
  };

  const titleStyle = {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    opacity: 0.9,
    marginBottom: 0
  };

  const authOptionsStyle = {
    display: 'flex',
    gap: '40px',
    justifyContent: 'center',
    marginBottom: '60px',
    flexWrap: 'wrap'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '40px 30px',
    minWidth: '280px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: 'white'
  };

  const cardTextStyle = {
    marginBottom: '25px',
    opacity: 0.8,
    lineHeight: 1.5
  };

  const btnStyle = {
    display: 'inline-block',
    padding: '12px 30px',
    borderRadius: '25px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  };

  const btnPrimaryStyle = {
    ...btnStyle,
    background: '#ff6b6b',
    color: 'white'
  };

  const btnSecondaryStyle = {
    ...btnStyle,
    background: 'transparent',
    color: 'white',
    borderColor: 'white'
  };

  const footerStyle = {
    opacity: 0.7
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>GenderPromptLens</h1>
          <p style={subtitleStyle}>Research Study</p>
        </header>
        
        <div style={authOptionsStyle}>
          <div 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {/* <h2 style={cardTitleStyle}>New User?</h2> */}
            <p style={cardTextStyle}>An account is required to start chatting</p>
            <Link 
              to="/register" 
              style={btnPrimaryStyle}
              onMouseEnter={(e) => {
                e.target.style.background = '#ff5252';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ff6b6b';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Sign Up
            </Link>
          </div>
          
          {/* <div 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <h2 style={cardTitleStyle}>Already have an account?</h2>
            <p style={cardTextStyle}>Welcome back! Sign in to continue</p>
            <Link 
              to="/login" 
              style={btnSecondaryStyle}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Sign In
            </Link>
          </div> */}
        </div>
        
        {/* <footer style={footerStyle}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>© 2025 GenderPromptLens. All rights reserved.</p>
        </footer> */}
      </div>
    </div>
  );
};

export default LandingPage;
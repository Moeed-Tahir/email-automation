"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const EmailAuthorize = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuthorize = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      setError("Please use a Gmail address.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // You might want to verify the email exists first
      router.push(`/api/routes/Google?action=startAuth&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("Failed to initiate authorization. Please try again.");
      setIsLoading(false);
    }
  };

  return (
      <div style={styles.card}>
        <h1 style={styles.title}>Connect Your Gmail</h1>
        <p style={styles.subtitle}>Authorize your Gmail account to start sending emails securely.</p>
        
        <input
          type="email"
          placeholder="Enter your Gmail address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          style={styles.input}
          autoFocus
        />
        
        {error && <p style={styles.error}>{error}</p>}
        
        <button 
          onClick={handleAuthorize} 
          style={isLoading ? {...styles.button, ...styles.loadingButton} : styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={styles.buttonContent}>
              <span style={styles.spinner}></span>
              Authorizing...
            </span>
          ) : (
            'Authorize with Google'
          )}
        </button>
        
        <p style={styles.disclaimer}>
          We'll redirect you to Google to securely authorize your account.
        </p>
      </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '450px',
    transition: 'all 0.3s ease',
  },
  title: {
    fontSize: '28px',
    marginBottom: '10px',
    color: '#202124',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: '15px',
    color: '#5f6368',
    marginBottom: '30px',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.3s',
  },
  inputFocus: {
    border: '1px solid #4285F4',
    boxShadow: '0 0 0 2px #e8f0fe',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4285F4',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  loadingButton: {
    backgroundColor: '#357ae8',
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTop: '2px solid white',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
  },
  error: {
    color: '#d93025',
    margin: '-10px 0 15px 0',
    fontSize: '14px',
    textAlign: 'left',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '20px',
    lineHeight: '1.5',
  },
};

export default EmailAuthorize;
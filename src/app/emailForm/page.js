"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: ''
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setIsSessionValid(false);
      setStatus({
        message: 'Session expired or invalid. Please re-authenticate.',
        type: 'error'
      });
    }
  }, [sessionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async () => {
    if (!sessionId) {
      setStatus({
        message: 'Session expired. Please re-authenticate.',
        type: 'error'
      });
      return;
    }

    if (!formData.to || !formData.subject || !formData.text) {
      setStatus({
        message: 'Please fill out all fields.',
        type: 'error'
      });
      return;
    }

    setIsSending(true);
    setStatus({ message: '', type: '' });

    try {
      const response = await fetch('/api/routes/Google?action=sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId, 
          ...formData 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      if (data.success) {
        setStatus({
          message: 'Email sent successfully!',
          type: 'success'
        });
        // Clear form on success
        setFormData({ to: '', subject: '', text: '' });
      } else {
        throw new Error(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        message: error.message || 'Failed to send email. Please try again.',
        type: 'error'
      });
      
      // If it's an auth error, mark session as invalid
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized_client')) {
        setIsSessionValid(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!isSessionValid) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Session Expired</h2>
          <p style={styles.statusError}>
            Your session has expired or is invalid. Please re-authenticate to continue.
          </p>
          <button 
            onClick={() => router.push('/')} 
            style={styles.button}
          >
            Go Back to Authorization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Send an Email</h2>
        
        <input
          type="email"
          name="to"
          placeholder="Recipient Email"
          value={formData.to}
          onChange={handleChange}
          style={styles.input}
          required
        />
        
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          style={styles.input}
          required
        />
        
        <textarea
          name="text"
          placeholder="Message"
          value={formData.text}
          onChange={handleChange}
          rows={6}
          style={{ ...styles.input, ...styles.textarea }}
          required
        />
        
        <button 
          onClick={handleSendEmail} 
          style={isSending ? {...styles.button, ...styles.loadingButton} : styles.button}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send Email'}
        </button>
        
        {status.message && (
          <p style={status.type === 'success' ? styles.statusSuccess : styles.statusError}>
            {status.message}
          </p>
        )}
      </div>
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
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '25px',
    color: '#202124',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s',
  },
  textarea: {
    minHeight: '150px',
    resize: 'vertical',
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#34a853',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  loadingButton: {
    backgroundColor: '#2d8e49',
    cursor: 'not-allowed',
  },
  statusSuccess: {
    color: '#34a853',
    marginTop: '15px',
    textAlign: 'center',
  },
  statusError: {
    color: '#d93025',
    marginTop: '15px',
    textAlign: 'center',
  },
};

export default Page;
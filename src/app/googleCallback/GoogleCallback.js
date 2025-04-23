import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const GoogleCallback = () => {
  const router = useRouter();
  const { name, email } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name && email) {
      setLoading(false);
      // Optionally store user in context/localStorage here
    }
  }, [name, email]);

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Authenticating...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Welcome, {name}!</h1>
      <p>You are signed in as <strong>{email}</strong></p>
    </div>
  );
};

export default GoogleCallback;

"use client";

export default function LinkedInLogin() {
  const handleLinkedInLogin = () => {
    window.location.href = "http://localhost:3000/api/routes/User?action=linkedInLogin";
  };

  return (
    <div>
      <button onClick={handleLinkedInLogin}>Login with LinkedIn</button>
    </div>
  );
}

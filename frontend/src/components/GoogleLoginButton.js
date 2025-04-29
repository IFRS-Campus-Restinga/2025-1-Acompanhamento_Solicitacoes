import React from "react";
import "./GoogleLoginButton.css";


const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login";
  };

  return (
    <button onClick={handleLogin} className="google-login-button">
    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" className="google-icon" />
      Entrar com Google
    </button>
  );
};

export default GoogleLoginButton;

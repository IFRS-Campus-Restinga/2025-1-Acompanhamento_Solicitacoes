import React from "react";

export default function PopupFeedback({ show, message, isError, onClose }) {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className={`popup-box ${isError ? "error" : "success"}`}>
        <p>{message}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}


import React from "react";
import "./popup.css";

const Feedback = ({ message, type, onClose }) => {

  return (
    <div className="popup-overlay">
      <div className={`popup-box ${type === "error" ? "error" : "success"}`}>
        <p>{message}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

export default Feedback;
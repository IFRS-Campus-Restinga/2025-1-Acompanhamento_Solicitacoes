import React from "react";
import "./usuarios.css";

export default function PopupFeedback({ show, mensagem, tipo, onClose }) {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className={`popup-box ${tipo === "erro" ? "error" : "success"}`}>
        <p>{mensagem}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
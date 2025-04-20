import React, { useEffect } from "react";
import "./popup.css";

export default function PopupFeedback({ show, mensagem, tipo, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // 4 segundos
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`popup-feedback-top ${tipo}`}>
      <p>{mensagem}</p>
    </div>
  );
}



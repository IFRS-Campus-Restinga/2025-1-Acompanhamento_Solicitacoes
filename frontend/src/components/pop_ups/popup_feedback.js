import { useEffect } from "react";
import "./popup.css";

export default function PopupFeedback({ 
  show, 
  mensagem, 
  tipo, 
  onClose,
  duracao = 4000 // Duração em milissegundos (padrão: 4 segundos)
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duracao);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duracao]);

  if (!show) return null;

  return (
    <div className={`popup-feedback-top ${tipo}`}>
      <p>{mensagem}</p>
    </div>
  );
}

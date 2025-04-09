import React from "react";
import "./abono.css";

export default function PopupConfirmacao({ show, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="popup-backdrop">
      <div className="popup-box">
        <p>Tem certeza que deseja excluir este motivo?</p>
        <div className="popup-actions">
          <button className="btn btn-confirm" onClick={onConfirm}>Confirmar</button>
          <button className="btn btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

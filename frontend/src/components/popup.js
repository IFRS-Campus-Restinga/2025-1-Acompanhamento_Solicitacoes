import React from "react";
import "./popup_confirmacao.css";

export default function Popup() {


  return (
    <dialog id="popup">
      <div className="popup-backdrop">
      <div className="popup-box">
        <p id="message"></p>
        <div className="popup-actions">
          <button className="btn btn-confirm" id="btnConfirmar">Confirmar</button>
          <button className="btn btn-cancel" id="btnCancelar">Cancelar</button>
        </div>
      </div>
    </div>
    </dialog>
    
  );
}

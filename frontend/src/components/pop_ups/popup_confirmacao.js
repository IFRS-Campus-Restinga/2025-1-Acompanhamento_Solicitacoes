import React, { useState } from "react";
import "./popup.css";

export default function PopupConfirmacao({ 
  show, 
  mensagem, 
  onConfirm, 
  onReject,
  onCancel,
  showRejectOption = false,
  confirmLabel = "Confirmar" 
}) {
  const [justificativa, setJustificativa] = useState("");
  const [mostrarErro, setMostrarErro] = useState(false);

  if (!show) return null;

  // Função para lidar com a rejeição
  const handleRejeitar = () => {
    if (!justificativa.trim()) {
      setMostrarErro(true);
      return;
    }
    setMostrarErro(false);
    onReject(justificativa);
    setJustificativa(""); // Limpa o campo após enviar
  };

  // Função para lidar com o cancelamento
  const handleCancelar = () => {
    setJustificativa(""); // Limpa o campo ao cancelar
    setMostrarErro(false);
    onCancel();
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-box">
        <p className="popup-mensagem">{mensagem || "Tem certeza que deseja continuar?"}</p>
        
 {/* Campo de justificativa para rejeição - exibido apenas quando showRejectOption é true */}
        {showRejectOption && (
          <div className="justificativa-container">
            <label htmlFor="justificativa">Justificativa, para o caso de rejeição de cadastro:</label>
            <textarea
              id="justificativa"
              className={`campo-justificativa ${mostrarErro ? 'campo-erro' : ''}`}
              value={justificativa}
              onChange={(e) => {
                setJustificativa(e.target.value);
                if (e.target.value.trim()) setMostrarErro(false);
              }}
              placeholder="Informe o motivo da rejeição do cadastro."
              rows={3}
            />
            {mostrarErro && (
              <p className="erro-mensagem">A justificativa é obrigatória para rejeitar o cadastro.</p>
            )}
          </div>
        )}
        
        <div className="popup-actions">
          <button className="btn btn-confirm" onClick={onConfirm}>{confirmLabel}</button>
          
          {/* Botão Rejeitar - exibido apenas quando showRejectOption é true */}
          {showRejectOption && onReject && (
            <button className="btn btn-reject" onClick={handleRejeitar}>Rejeitar</button>
          )}
          
          <button className="btn btn-cancel" onClick={handleCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

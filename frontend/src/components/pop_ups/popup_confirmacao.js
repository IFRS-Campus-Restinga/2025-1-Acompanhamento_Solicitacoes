import React, { useState } from "react";
import "./popup.css";

export default function PopupConfirmacao({ 
  show, 
  mensagem, 
  onConfirm, 
  onReject, 
  onCancel,
  showRejectOption = false,
  confirmLabel = "Confirmar",
  usuarioDetalhes = null // Nova prop para receber os detalhes do usuário
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

  // Renderiza os detalhes do usuário com base no grupo
  const renderizarDetalhesUsuario = () => {
    if (!usuarioDetalhes) return null;

    return (
      <div className="detalhes-usuario-popup">
        <h5>Dados do Usuário:</h5>
        <div className="detalhes-usuario-conteudo">
          <p><strong>Nome:</strong> {usuarioDetalhes.nome}</p>
          <p><strong>Email:</strong> {usuarioDetalhes.email}</p>
          <p><strong>CPF:</strong> {usuarioDetalhes.cpf}</p>
          <p><strong>Telefone:</strong> {usuarioDetalhes.telefone}</p>
          <p><strong>Tipo de Usuário:</strong> {usuarioDetalhes.grupo === "Responsavel" ? "Responsável" : usuarioDetalhes.grupo}</p>

          {usuarioDetalhes.grupo === "Coordenador" && (
            <>
              <p><strong>SIAPE:</strong> {usuarioDetalhes.grupo_detalhes?.siape}</p>
              {(() => {
                const mandatos = usuarioDetalhes.grupo_detalhes?.mandatos_coordenador || [];
                if (mandatos.length === 0) {
                  return <p><em>Sem mandatos registrados.</em></p>;
                }
                return mandatos.map((mandato, idx) => (
                  <div key={idx} className="mandato-item">
                    <p><strong>Curso:</strong> {mandato.curso}</p>
                    <p><strong>Início do Mandato:</strong> {mandato.inicio_mandato}</p>
                    <p><strong>Fim do Mandato:</strong> {mandato.fim_mandato || "-"}</p>
                  </div>
                ));
              })()}
            </>
          )}

          {usuarioDetalhes.grupo === "CRE" && (
            <p><strong>SIAPE:</strong> {usuarioDetalhes.grupo_detalhes?.siape}</p>
          )}

          {usuarioDetalhes.grupo === "Responsável" && (
            <>
              <p><strong>Responsável de:</strong> {usuarioDetalhes.grupo_detalhes?.aluno || "Nenhum aluno"}</p>
              <p><strong>E-mail do aluno:</strong> {usuarioDetalhes.grupo_detalhes?.email_aluno || "Não cadastrado"}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-box">
        <p className="popup-mensagem"><strong>{mensagem || "Tem certeza que deseja continuar?"}</strong></p>
        
        {/* Detalhes do usuário - exibido apenas quando usuarioDetalhes é fornecido */}
        <div className="popup-box-detalhes">
        {usuarioDetalhes && renderizarDetalhesUsuario()}
        </div>
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

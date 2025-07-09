import { useState } from "react";
import "./popup.css";

export default function PopupConfirmacao({ 
  show, 
  mensagem, 
  onConfirm, 
  onReject, 
  onCancel,
  showRejectOption = false,
  confirmLabel = "Confirmar",
  actionType = "default", // "default", "delete", "approve", "reject"
  usuarioDetalhes = null,
  showJustificativa = false // Nova prop para controlar a exibição da justificativa
}) {
  const [justificativa, setJustificativa] = useState("");
  const [mostrarErro, setMostrarErro] = useState(false);

  if (!show) return null;

  // Determina a classe do botão baseada no tipo de ação
  const getButtonClass = () => {
    switch (actionType) {
      case "delete":
        return "btn btn-delete";
      case "reject":
        return "btn btn-reject";
      case "approve":
      case "default":
      default:
        return "btn btn-confirm";
    }
  };

  // Função para lidar com a confirmação
  const handleConfirmar = () => {
    // Se é uma ação que requer justificativa e ela não foi preenchida
    if (showJustificativa && !justificativa.trim()) {
      setMostrarErro(true);
      return;
    }
    
    setMostrarErro(false);
    
    // Se há justificativa, passa ela junto
    if (showJustificativa && justificativa.trim()) {
      onConfirm(justificativa);
    } else {
      onConfirm();
    }
    
    setJustificativa(""); // Limpa o campo após enviar
  };

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
          <p><strong>Tipo de Usuário:</strong> {usuarioDetalhes.grupo === "Responsavel" ? "Responsavel" : usuarioDetalhes.grupo}</p>

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

          {usuarioDetalhes.grupo === "Responsavel" && (
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
        {usuarioDetalhes && (
          <div className="popup-box-detalhes">
            {renderizarDetalhesUsuario()}
          </div>
        )}

        {/* Campo de justificativa - exibido quando showJustificativa é true ou showRejectOption é true */}
        {(showJustificativa || showRejectOption) && (
          <div className="justificativa-container">
            <label htmlFor="justificativa">
              {showRejectOption 
                ? "Justificativa para rejeição de cadastro:" 
                : "Justificativa:"
              }
            </label>
            <textarea
              id="justificativa"
              className={`campo-justificativa ${mostrarErro ? 'campo-erro' : ''}`}
              value={justificativa}
              onChange={(e) => {
                setJustificativa(e.target.value);
                if (e.target.value.trim()) setMostrarErro(false);
              }}
              placeholder={
                showRejectOption 
                  ? "Informe o motivo da rejeição do cadastro."
                  : "Informe a justificativa para esta ação."
              }
              rows={3}
            />
            {mostrarErro && (
              <p className="erro-mensagem">
                A justificativa é obrigatória para esta ação.
              </p>
            )}
          </div>
        )}
        
        <div className="popup-actions">
          <button className={getButtonClass()} onClick={handleConfirmar}>
            {confirmLabel}
          </button>
          
          {/* Botão Rejeitar - exibido apenas quando showRejectOption é true */}
          {showRejectOption && onReject && (
            <button className="btn btn-reject" onClick={handleRejeitar}>
              Rejeitar
            </button>
          )}
          
          <button className="btn btn-cancel" onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}


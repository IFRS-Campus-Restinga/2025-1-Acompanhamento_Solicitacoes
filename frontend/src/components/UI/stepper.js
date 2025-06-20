import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./stepper.css"; // Arquivo CSS separado

const ETAPAS = ["Em Análise", "Aprovado", "Registrado"];

const ICONES = {
  "Em Análise": "bi-clock",
  "Aprovado": "bi-check-circle",
  "Registrado": "bi-flag"
};

const CORES = {
  "Em Análise": { class: "bg-warning", hex: "#ffc107" }, // Laranja
  "Aprovado": { class: "bg-success", hex: "#198754" },   // Verde
  "Registrado": { class: "bg-primary", hex: "#0d6efd" }   // Azul
};

export default function Stepper({ statusAtual }) {
  if (!ETAPAS.includes(statusAtual)) {
    console.warn(`Status inválido: "${statusAtual}". O status deve ser um dos seguintes: ${ETAPAS.join(", ")}.`);
    return (
      <div className="stepper-wrapper">
        <p className="text-danger text-center">Erro: Status de etapa inválido.</p>
      </div>
    );
  }

  const indexAtual = ETAPAS.indexOf(statusAtual);
  // A barra de progresso inferior está comentada, então progressoPercentual não é usada visualmente aqui.
  const progressoPercentual = (indexAtual / (ETAPAS.length - 1)) * 100;

  return (
    <div className="stepper-wrapper">
      <div className="stepper-stages">
        {ETAPAS.map((etapa, index) => {
          const atingida = index <= indexAtual;
          const corEtapa = CORES[etapa];

          let connectorBackground = "#dee2e6"; // Cor padrão (cinza) para linhas não atingidas
          let isAnimating = false; // Flag para aplicar animação

          if (index > 0) {
            const corDaEtapaAnterior = CORES[ETAPAS[index - 1]]?.hex || "#dee2e6";

            if ((index - 1) < indexAtual) {
              // Se a etapa anterior já foi concluída, a linha é sólida com a cor dela
              connectorBackground = corDaEtapaAnterior;
            }

            // Se esta linha conecta a etapa ATUAL com a PRÓXIMA
            if (index - 1 === indexAtual && indexAtual < ETAPAS.length - 1) {
              const corDaEtapaAtual = CORES[etapa].hex; // Cor da etapa seguinte (que está para ser atingida)
              // Define o gradiente da cor anterior para a cor atual
              connectorBackground = `linear-gradient(to right, ${corDaEtapaAnterior}, ${corDaEtapaAtual})`;
              isAnimating = true; // Ativa a animação para esta linha
            }
          }

          return (
            <React.Fragment key={etapa}>
              {index > 0 && (
                <div
                  className={`stepper-connector ${isAnimating ? 'animating' : ''}`}
                  // Para a linha animada, usamos backgroundImage. Para as outras, backgroundColor.
                  style={{ backgroundImage: isAnimating ? connectorBackground : 'none',
                           backgroundColor: isAnimating ? 'transparent' : connectorBackground // Fundo transparente se for animar, senão a cor sólida
                         }}
                ></div>
              )}
              <div className="stepper-item">
                <div
                  className={`stepper-circle ${atingida ? corEtapa.class : "bg-light text-muted"}`}
                >
                  <i className={`bi ${ICONES[etapa]}`}></i>
                </div>
                <div className="stepper-label">{etapa}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* A barra de progresso inferior está comentada */}
      {/*
      <div className="progress stepper-progress">
        <div
          className={`progress-bar ${CORES[statusAtual].class}`}
          role="progressbar"
          style={{ width: `${progressoPercentual}%` }}
          aria-valuenow={progressoPercentual}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      */}
    </div>
  );
}
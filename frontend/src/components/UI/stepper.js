import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./stepper.css"; // Arquivo CSS separado

const ETAPAS_BASE = ["Em Análise", "Aprovado", "Registrado"];

const ICONES = {
  "Em Análise": "bi-clock",
  "Aprovado": "bi-check-circle",
  "Registrado": "bi-flag",
  "Reprovado": "bi bi-x-circle"
};

const CORES = {
  "Em Análise": { class: "bg-warning", hex: "#ffc107" }, // Laranja
  "Aprovado": { class: "bg-success", hex: "#198754" },   // Verde
  "Registrado": { class: "bg-primary", hex: "#0d6efd" }, // Azul
  "Reprovado": { class: "bg-danger", hex: "ee1100"} // Vermelho
};

const getEtapasAtivas = (status) => {
  if (status === "Reprovado") {
    return ["Em Análise", "Reprovado", "Registrado"]; // Reprovado no lugar de Aprovado
  } else if (status === "Registrado") {
    // Verifica se foi aprovado ou reprovado antes do registro
    const etapaAnterior = localStorage.getItem("etapaAnterior") || "Aprovado"; // ou outro mecanismo
    return ["Em Análise", etapaAnterior, "Registrado"];
  }
  return ETAPAS_BASE;
};


export default function Stepper({ statusAtual }) {
  const etapasAtuais = getEtapasAtivas(statusAtual);

  if (!etapasAtuais.includes(statusAtual)) {
    console.warn(`Status inválido: "${statusAtual}". O status deve ser um dos seguintes: ${etapasAtuais.join(", ")}.`);
    return (
      <div className="stepper-wrapper">
        <p className="text-danger text-center">Erro: Status de etapa inválido.</p>
      </div>
    );
  }

  const indexAtual = etapasAtuais.indexOf(statusAtual);
  const progressoPercentual = (indexAtual / (etapasAtuais.length - 1)) * 100;

  return (
    <div className="stepper-wrapper">
      <div className="stepper-stages">
        {etapasAtuais.map((etapa, index) => {
          const atingida = index <= indexAtual;
          const corEtapa = CORES[etapa];
          let connectorBackground = "#dee2e6";
          let isAnimating = false;

          if (index > 0) {
            const corAnterior = CORES[etapasAtuais[index - 1]]?.hex || "#dee2e6";

            if ((index - 1) < indexAtual) {
              connectorBackground = corAnterior;
            }

            if (index - 1 === indexAtual && indexAtual < etapasAtuais.length - 1) {
              const corAtual = corEtapa.hex;
              connectorBackground = `linear-gradient(to right, ${corAnterior}, ${corAtual})`;
              isAnimating = true;
            }
          }

          return (
            <React.Fragment key={etapa}>
              {index > 0 && (
                <div
                  className={`stepper-connector ${isAnimating ? 'animating' : ''}`}
                  style={{
                    backgroundImage: isAnimating ? connectorBackground : 'none',
                    backgroundColor: isAnimating ? 'transparent' : connectorBackground
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
    </div>
  );
}
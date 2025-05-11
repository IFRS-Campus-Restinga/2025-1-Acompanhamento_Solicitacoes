import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarCalendario() {
  const [codigo, setCodigo] = useState("");
  const [formulario, setFormulario] = useState("");
  const [tipoCurso, setTipoCurso] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const navigate = useNavigate();
  const { codigo: codigoParam } = useParams();

  // Opções fixas (espelham o backend)
  const FORMULARIO_CHOICES = [
    { value: "TRANCAMENTODISCIPLINA", label: "Trancamento de Disciplina" },
    { value: "TRANCAMENTOMATRICULA", label: "Trancamento de Matrícula" },
    { value: "DISPENSAEDFISICA", label: "Dispensa de Educação Física" },
    { value: "DESISTENCIAVAGA", label: "Desistência de Vaga" },
    { value: "EXERCICIOSDOMICILIARES", label: "Exercícios Domiciliares" },
    { value: "ABONOFALTAS", label: "Abono de Faltas" },
    { value: "ENTREGACERTIFICADOS", label: "Entrega de Certificados" }
  ];

  const TIPO_CURSO_CHOICES = [
    { value: "GRADUACAO", label: "Graduação (Semestral)" },
    { value: "MEDIO", label: "Ensino Médio Integrado (Anual)" }
  ];

  // Se for edição, carrega dados existentes
  useEffect(() => {
    if (codigoParam) {
      axios
        .get(`http://localhost:8000/solicitacoes/calendarios/${codigoParam}/`)
        .then((res) => {
          setCodigo(res.data.codigo);
          setFormulario(res.data.formulario);
          setTipoCurso(res.data.tipo_curso);
          setDataInicio(res.data.data_inicio);
          setDataFim(res.data.data_fim);
        })
        .catch((err) => {
          setMensagem(
            `Erro ${err.response?.status || ""}: ${
              err.response?.data?.detail || "Erro ao carregar calendário."
            }`
          );
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [codigoParam]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica das datas
    if (new Date(dataFim) < new Date(dataInicio)) {
      setMensagem("A data final não pode ser anterior à data inicial");
      setTipoMensagem("erro");
      setShowFeedback(true);
      return;
    }

    const dados = {
      codigo,
      formulario,
      tipo_curso: tipoCurso,
      data_inicio: dataInicio,
      data_fim: dataFim
    };

    const requisicao = codigoParam
      ? axios.put(`http://localhost:8000/solicitacoes/calendarios/${codigoParam}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/calendarios/", dados);

    requisicao
      .then(() => {
        setMensagem(
          codigoParam 
            ? "Calendário atualizado com sucesso" 
            : "Calendário cadastrado com sucesso"
        );
        setTipoMensagem("sucesso");
        setCadastroSucesso(true);
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao salvar calendário"
          }`
        );
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{codigoParam ? "Editar Calendário" : "Cadastrar Calendário"}</h2>
        
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código do Período</label>
            <input
              type="text"
              className="input-text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength="10"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Formulário:</label>
              <select
                className="input-text"
                value={formulario}
                onChange={(e) => setFormulario(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {FORMULARIO_CHOICES.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Curso:</label>
              <select
                className="input-text"
                value={tipoCurso}
                onChange={(e) => setTipoCurso(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {TIPO_CURSO_CHOICES.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="calendar-card">
              <label>Data Início:</label>
              <input
                type="date"
                className="date-picker-visible"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
              <div className="date-display-box">
                {dataInicio 
                  ? new Date(dataInicio).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) 
                  : "DD/MM/AAAA"}
              </div>
            </div>

            <div className="calendar-card">
              <label>Data Fim:</label>
              <input
                type="date"
                className="date-picker-visible"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                min={dataInicio}
                required
              />
              <div className="date-display-box">
                {dataFim 
                  ? new Date(dataFim).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) 
                  : "DD/MM/AAAA"}
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button">
            {codigoParam ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            if (cadastroSucesso) {
              navigate("/calendarios");
            }
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
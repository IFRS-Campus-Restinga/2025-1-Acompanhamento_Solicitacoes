import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarDisponibilidade() {
  const [formulario, setFormulario] = useState("");
  const [sempreDisponivel, setSempreDisponivel] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const FORMULARIO_CHOICES = [
    { value: "TRANCAMENTODISCIPLINA", label: "Trancamento de Disciplina" },
    { value: "TRANCAMENTOMATRICULA", label: "Trancamento de Matrícula" },
    { value: "DISPENSAEDFISICA", label: "Dispensa de Educação Física" },
    { value: "DESISTENCIAVAGA", label: "Desistência de Vaga" },
    { value: "EXERCICIOSDOMICILIARES", label: "Exercícios Domiciliares" },
    { value: "ABONOFALTAS", label: "Abono de Faltas" },
    { value: "ENTREGACERTIFICADOS", label: "Entrega de Certificados" }
  ];

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/disponibilidades/${id}/`)
        .then((res) => {
          setFormulario(res.data.formulario);
          setSempreDisponivel(res.data.sempre_disponivel);
          setDataInicio(res.data.data_inicio?.split('T')[0] || "");
          setDataFim(res.data.data_fim?.split('T')[0] || "");
          setAtivo(res.data.ativo);
        })
        .catch((err) => {
          setMensagem(`Erro ao carregar: ${err.response?.data?.detail || "Dados não encontrados"}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação para formulários com prazo
    if (!sempreDisponivel) {
      if (!dataInicio || !dataFim) {
        setMensagem("Defina as datas para formulários com prazo");
        setTipoMensagem("erro");
        setShowFeedback(true);
        return;
      }
      if (new Date(dataFim) < new Date(dataInicio)) {
        setMensagem("Data final não pode ser anterior à inicial");
        setTipoMensagem("erro");
        setShowFeedback(true);
        return;
      }
    }

    const dados = {
      formulario,
      sempre_disponivel: sempreDisponivel,
      data_inicio: sempreDisponivel ? null : dataInicio,
      data_fim: sempreDisponivel ? null : dataFim,
      ativo
    };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/disponibilidades/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/disponibilidades/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Atualizado com sucesso" : "Cadastrado com sucesso");
        setTipoMensagem("sucesso");
        setCadastroSucesso(true);
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(`Erro: ${err.response?.data?.detail || "Falha na operação"}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <HeaderCRE />
      <main className="container form-container">
        <h2>{id ? "Editar Prazo" : "Prazos de Formulários"}</h2>
        
        <form className="form-box" onSubmit={handleSubmit}>
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
            <label>
              <input
                type="checkbox"
                checked={sempreDisponivel}
                onChange={(e) => {
                  setSempreDisponivel(e.target.checked);
                  if (e.target.checked) {
                    setDataInicio("");
                    setDataFim("");
                  }
                }}
              />
              Sempre disponível
            </label>
          </div>

          {!sempreDisponivel && (
            <div className="form-row">
              <div className="calendar-card">
                <label>Data Início:</label>
                <input
                  type="date"
                  className="date-picker-visible"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required={!sempreDisponivel}
                />
                <div className="date-display-box">
                  {dataInicio 
                    ? new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') 
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
                  required={!sempreDisponivel}
                />
                <div className="date-display-box">
                  {dataFim 
                    ? new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR') 
                    : "DD/MM/AAAA"}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              Ativo
            </label>
          </div>

          <button type="submit" className="submit-button">
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            if (cadastroSucesso) {
              navigate("/disponibilidades");
            }
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
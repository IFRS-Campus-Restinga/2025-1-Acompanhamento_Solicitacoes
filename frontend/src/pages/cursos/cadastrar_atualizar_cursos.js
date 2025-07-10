import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

//CSS
import "../../components/styles/formulario.css";

export default function CadastrarAtualizarCursos() {
  const [codigoInput, setCodigoInput] = useState("");
  const [nome, setNome] = useState("");
  const [selectedPpcs, setSelectedPpcs] = useState([]);
  const [availablePpcs, setAvailablePpcs] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [tipoPeriodo, setTipoPeriodo] = useState(""); 
  const [tipoCurso, setTipoCurso] = useState("");

  // Definindo as opções de Tipo de Período e Tipo de Curso diretamente no frontend
  // Espelham as TextChoices do seu modelo Django
  const tipoPeriodoOptions = [
    { value: "Anual", label: "Anual" },
    { value: "Semestral", label: "Semestral" },
  ];

  const tipoCursoOptions = [
    { value: "EMI", label: "Ensino Médio Integral" },
    { value: "SUBS", label: "Subsequente" },
    { value: "CONC", label: "Concomitante" },
    { value: "SUCON", label: "Subsequente/Concomitante" },
    { value: "SUP", label: "Superior" },
  ];

  const navigate = useNavigate();
  const { codigo } = useParams();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/ppcs/")
      .then((res) => setAvailablePpcs(res.data))
      .catch((err) => console.error("Erro ao carregar PPCs:", err));
  }, []);

  useEffect(() => {
    if (codigo) {
      axios
        .get(`http://localhost:8000/solicitacoes/cursos/${codigo}/`)
        .then((res) => {
          setCodigoInput(res.data.codigo);
          setNome(res.data.nome);
          setSelectedPpcs(res.data.ppcs || []);
          // Define os valores do backend para os campos de seleção
          setTipoPeriodo(res.data.tipo_periodo || "");
          setTipoCurso(res.data.tipo_curso || "");
        })
        .catch((err) => {
          setMensagem(
            `Erro ${err.response?.status || ""}: ${
              err.response?.data?.detail || "Erro ao carregar curso."
            }`
          );
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [codigo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = {
      codigo: codigoInput,
      nome,
      ppcs: selectedPpcs,
      tipo_periodo: tipoPeriodo,
      tipo_curso: tipoCurso,
    };

    const requisicao = codigo
      ? axios.put(`http://localhost:8000/solicitacoes/cursos/${codigo}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/cursos/", dados);

    requisicao
      .then(() => {
        setMensagem(
          codigo
            ? "Curso atualizado com sucesso!"
            : "Curso cadastrado com sucesso!"
        );
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao salvar curso."
          }`
        );
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  const handlePpcSelection = (e) => {
    const newSelection = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedPpcs(newSelection);
  };

  return (
    <div>
      <main className="container form-container">
        <h2>{codigo ? "Editar Curso" : "Cadastrar Novo Curso"}</h2>
        <form className="formulario formulario-largura" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código do Curso:</label>
            {codigo ? (
              <input
                type="text"
                className="input-text"
                value={codigoInput}
                disabled
              />
            ) : (
              <input
                type="text"
                className="input-text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                required
              />
            )}
          </div>
          <div className="form-group">
            <label>Nome do Curso:</label>
            <input
              type="text"
              className="input-text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Período:</label>
            <select
              className="input-text"
              value={tipoPeriodo}
              onChange={(e) => setTipoPeriodo(e.target.value)}
              required
            >
              <option value="">Selecione o tipo de período</option>
              {tipoPeriodoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de seleção para Tipo de Curso */}
          <div className="form-group">
            <label>Tipo de Curso:</label>
            <select
              className="input-text"
              value={tipoCurso}
              onChange={(e) => setTipoCurso(e.target.value)}
              required
            >
              <option value="">Selecione o tipo de curso</option>
              {tipoCursoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Adicionei o campo de seleção de PPCs aqui, já que está na sua lógica, mas não no JSX anterior */}
          {/*
          <div className="form-group">
            <label>PPCs Associados (segure Ctrl/Cmd para múltiplas seleções):</label>
            <select
              className="input-text"
              multiple
              value={selectedPpcs}
              onChange={handlePpcSelection}
            >
              {availablePpcs.map((ppc) => (
                <option key={ppc.codigo} value={ppc.codigo}>
                  {ppc.nome} ({ppc.codigo})
                </option>
              ))}
            </select>
          </div>
          */}

          <button type="submit" className="botao-generico">
            {codigo ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            navigate(location.state?.from || "/cursos");
          }}
        />
      </main>
    </div>
  );
}

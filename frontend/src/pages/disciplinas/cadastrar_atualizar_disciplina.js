import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarDisciplina() {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [selectedPpc, setSelectedPpc] = useState("");
  const [periodo, setPeriodo] = useState("1º Ano");
  const [availablePpcs, setAvailablePpcs] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const periodosDisponiveis = [
    "1º Ano", "2º Ano", "3º Ano", "4º Ano",
    "1º Semestre", "2º Semestre", "3º Semestre", "4º Semestre",
    "5º Semestre", "6º Semestre", "7º Semestre", "8º Semestre",
    "9º Semestre", "10º Semestre"
  ];

  const navigate = useNavigate();
  const { codigo: codigoParam } = useParams();

  // Carrega os PPCs disponíveis
  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/ppcs/")
      .then((res) => setAvailablePpcs(res.data))
      .catch((err) => console.error("Erro ao carregar Ppcs:", err));
  }, []);

  // Se for edição, carrega dados da disciplina
  useEffect(() => {
    if (codigoParam) {
      axios
        .get(`http://localhost:8000/solicitacoes/disciplinas/${codigoParam}/`)
        .then((res) => {
          setNome(res.data.nome);
          setCodigo(res.data.codigo);
          setPeriodo(res.data.periodo || "1º Ano");
          
          // Verifique a estrutura dos dados do PPC. Assume-se que res.data.ppcs seja um array.
          if (res.data.ppc) {
            setSelectedPpc(res.data.ppc); // <- Isso assume que o backend retorna "ppc": "2021.1" por exemplo
          } else if (res.data.ppcs && res.data.ppcs.length > 0) {
            setSelectedPpc(res.data.ppcs[0]?.codigo || "");
          } else {
            setSelectedPpc("");
          }
        })
        .catch((err) => {
          setMensagem(
            `Erro ${err.response?.status || ""}: ${
              err.response?.data?.detail || "Erro ao carregar disciplina."
            }`
          );
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [codigoParam]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedPpc && !codigoParam) {
      setMensagem("Por favor, selecione um PPC.");
      setTipoMensagem("erro");
      setShowFeedback(true);
      return;
    }

    const dados = { nome, codigo, periodo, ppc: selectedPpc};

    const requisicao = codigoParam
      ? axios.put(`http://localhost:8000/solicitacoes/disciplinas/${codigoParam}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/disciplinas/", dados);

    requisicao
      .then(() => {
        setMensagem(codigoParam ? "Disciplina atualizada com sucesso!" : "Disciplina cadastrada com sucesso!");
        setTipoMensagem("sucesso");
        setCadastroSucesso(true); // <- Marca sucesso
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao salvar disciplina."
          }`
        );
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  const filteredPpcs = availablePpcs.filter(ppc =>
    ppc.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <main className="container form-container">
        <h2>{codigoParam ? "Editar Disciplina" : "Cadastrar Nova Disciplina"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Disciplina:</label>
            <input
              type="text"
              className="input-text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Código da Disciplina:</label>
            <input
              type="text"
              className="input-text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Período:</label>
            <select
              className="input-text"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              required
            >
              {periodosDisponiveis.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Selecione um Ppc:</label>
            <div className="barra-pesquisa">
              <i className="bi bi-search icone-pesquisa"></i>
              <input
                type="text"
                placeholder="Buscar Ppcs..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="input-pesquisa"
              />
            </div>
            <div className="ppc-selection-box">
              {filteredPpcs.map((ppc) => (
                <div 
                  key={ppc.codigo}
                  className={`ppc-option ${selectedPpc === ppc.codigo ? 'selected' : ''}`}
                  onClick={() => setSelectedPpc(ppc.codigo)}
                >
                  {ppc.codigo}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>PPC Selecionado:</label>
            {selectedPpc && (
              <div className="selected-ppc-box">
                {selectedPpc}
                <button
                  type="button"
                  onClick={() => setSelectedPpc("")}
                  className="remove-btn"
                >
                  X
                </button>
              </div>
            )}
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
              navigate("/disciplinas");
            }
          }}
        />
      </main>
    </div>
  );
}
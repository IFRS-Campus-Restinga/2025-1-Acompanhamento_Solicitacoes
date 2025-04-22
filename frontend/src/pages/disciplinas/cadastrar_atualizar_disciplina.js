import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarDisciplina() {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [selectedPpcs, setSelectedPpcs] = useState([]);
  const [availablePpcs, setAvailablePpcs] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [cadastroSucesso, setCadastroSucesso] = useState(false); // <- Adicionado

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
          setSelectedPpcs(res.data.ppcs.map(p => p.codigo));
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

    if (selectedPpcs.length === 0) {
      setMensagem("Por favor, selecione ao menos um PPC.");
      setTipoMensagem("erro");
      setShowFeedback(true);
      return;
    }

    const dados = { nome, codigo, ppcs: selectedPpcs };

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

  const handlePpcSelection = (e) => {
    const ppcSelecionada = e.target.value;
    if (selectedPpcs.includes(ppcSelecionada)) {
      setSelectedPpcs(selectedPpcs.filter(p => p !== ppcSelecionada));
    } else {
      setSelectedPpcs([...selectedPpcs, ppcSelecionada]);
    }
  };

  const handleRemovePpc = (codigo) => {
    setSelectedPpcs(selectedPpcs.filter(p => p !== codigo));
  };

  const filteredPpcs = availablePpcs.filter(ppc =>
    ppc.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <Header />
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
            <select
              multiple
              className="input-select"
              onChange={handlePpcSelection}
            >
              {filteredPpcs.map((ppc) => (
                <option
                  key={ppc.codigo}
                  value={ppc.codigo}
                  className={selectedPpcs.includes(ppc.codigo) ? "option-selected" : ""}
                >
                  {ppc.codigo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ppc Selecionado:</label>
            <ul>
              {selectedPpcs.map((codigo) => {
                const ppc = availablePpcs.find(p => p.codigo === codigo);
                return (
                  <li key={codigo}>
                    {ppc ? `${ppc.codigo}` : 'Desconhecido'}
                    <button type="button" onClick={() => handleRemovePpc(codigo)} className="remove-btn">X</button>
                  </li>
                );
              })}
            </ul>
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
      <Footer />
    </div>
  );
}
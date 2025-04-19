import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./turma.css";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarTurma() {
  const [nome, setNome] = useState("");
  const [selectedDisciplinas, setSelectedDisciplinas] = useState([]); // Armazena as disciplinas selecionadas
  const [availableDisciplinas, setAvailableDisciplinas] = useState([]); // Armazena as disciplinas disponíveis
  const [filtro, setFiltro] = useState(""); // Armazena o filtro de busca
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega as disciplinas disponíveis
  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/disciplinas/")
      .then((res) => setAvailableDisciplinas(res.data))
      .catch((err) =>
        console.error("Erro ao carregar disciplinas:", err)
      );
  }, []);

  // Carrega os dados da turma se for edição
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8000/solicitacoes/turmas/${id}/`)
        .then((res) => {
          setNome(res.data.nome);
          setSelectedDisciplinas(res.data.disciplinas.map(d => d.codigo)); // Ajusta para o código da disciplina
        })
        .catch((err) => {
          setMensagem(
            `Erro ${err.response?.status || ""}: ${
              err.response?.data?.detail || "Erro ao carregar turma."
            }`
          );
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { nome, disciplinas: selectedDisciplinas }; // Passando os códigos das disciplinas

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/turmas/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/turmas/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Turma atualizada com sucesso!" : "Turma cadastrada com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao salvar turma."
          }`
        );
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  const handleDisciplinaSelection = (e) => {
    const disciplinaSelecionada = e.target.value;
    if (selectedDisciplinas.includes(disciplinaSelecionada)) {
      setSelectedDisciplinas(selectedDisciplinas.filter(d => d !== disciplinaSelecionada)); // Remove se já estiver selecionada
    } else {
      setSelectedDisciplinas([...selectedDisciplinas, disciplinaSelecionada]); // Adiciona à seleção
    }
  };

  const handleRemoveDisciplina = (codigo) => {
    setSelectedDisciplinas(selectedDisciplinas.filter(d => d !== codigo)); // Remove a disciplina selecionada
  };

  const filteredDisciplinas = availableDisciplinas.filter(disciplina =>
    disciplina.nome.toLowerCase().includes(filtro.toLowerCase()) // Filtra disciplinas com base na pesquisa
  );

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Turma" : "Cadastrar Nova Turma"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Turma:</label>
            <input
              type="text"
              className="input-text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Selecione as Disciplinas:</label>
            {/* Barra de pesquisa idêntica à listagem de turmas */}
            <div className="barra-pesquisa">
              <i className="bi bi-search icone-pesquisa"></i>
              <input
                type="text"
                placeholder="Buscar Disciplina..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)} // Atualiza o termo de busca
                className="input-pesquisa"
              />
            </div>
            <select
              multiple
              className="input-select"
              value={[]} // ← Evita o estilo nativo de seleção
              onChange={handleDisciplinaSelection}
            > 
              {filteredDisciplinas.map((disciplina) => (
                <option
                  key={disciplina.codigo}
                  value={disciplina.codigo}
                  className={selectedDisciplinas.includes(disciplina.codigo) ? "option-selected" : ""}
                >
                  {disciplina.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Exibe as disciplinas selecionadas com o botão de remoção */}
          <div className="form-group">
            <label>Disciplinas Selecionadas:</label>
            <ul>
              {selectedDisciplinas.map((codigo) => {
                const disciplina = availableDisciplinas.find(d => d.codigo === codigo);
                return (
                  <li key={codigo}>
                    {disciplina ? disciplina.nome : 'Desconhecido'}
                    <button type="button" onClick={() => handleRemoveDisciplina(codigo)} className="remove-btn">X</button>
                  </li>
                );
              })}
            </ul>
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
            navigate("/turmas");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Ajuste na importação do Header conforme o último arquivo do usuário
import "./grupo.css";

// POPUPS
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../components/UI/paginacao";

// BOTÕES
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoEditar from "../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

// BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";

//CSS
import '../../components/styles/tabela.css';

import './lista_grupos_usuarios.css';
import VisualizarUsuariosGrupoModal from "./vizualizar_grupos_usuarios.js";

export default function ListarGrupos() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [grupoParaExcluir, setGrupoParaExcluir] = useState(null); // Renomeado para clareza
  const [mostrarPopupConfirmacao, setMostrarPopupConfirmacao] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const itensPorPagina = 10;

  // *** NOVO: Estados para o modal de visualização ***
  const [mostrarModalUsuarios, setMostrarModalUsuarios] = useState(false);
  const [grupoSelecionadoParaVer, setGrupoSelecionadoParaVer] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/grupos/")
      .then((res) => {
        setGrupos(res.data); 
        setPaginaAtual(1); 
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar grupos."}`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const filtrarGrupos = () => {
    const termo = filtro.toLowerCase();
    if (!termo) {
      return grupos; 
    }
    return grupos.filter((grupo) =>
      (grupo.name || "").toLowerCase().includes(termo) || 
      (grupo.id + "").includes(termo) 
    );
  };

  const gruposFiltrados = filtrarGrupos();

  const gruposPaginados = gruposFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/grupos/${grupoParaExcluir}/`)
      .then(() => {
        setMensagemPopup("Grupo excluído com sucesso.");
        setTipoMensagem("sucesso");
        setGrupos(grupos.filter((g) => g.id !== grupoParaExcluir));
        if (gruposPaginados.length === 1 && paginaAtual > 1) {
          setPaginaAtual(paginaAtual - 1);
        }
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir grupo."}`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopupConfirmacao(false);
        setMostrarFeedback(true);
        setGrupoParaExcluir(null);
      });
  };

  // *** NOVO: Função para abrir o modal de visualização ***
  const handleAbrirModalUsuarios = (grupo) => {
    setGrupoSelecionadoParaVer(grupo);
    setMostrarModalUsuarios(true);
  };

  // *** NOVO: Função para fechar o modal de visualização ***
  const handleFecharModalUsuarios = () => {
    setMostrarModalUsuarios(false);
    setGrupoSelecionadoParaVer(null);
  };

  return (
    <div>
      {/* Usando HeaderCRE conforme o último arquivo do usuário */}
      <main className="container">
        <h2>Grupos</h2>

        <div className="botoes-wrapper" style={{ marginBottom: "20px", marginTop: "20px" }}>
          <BotaoCadastrar to="/grupos/cadastrar" title="Criar Novo Grupo" /> 
        </div>

        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1); 
          }}
          placeholder="Pesquisar por ID ou Nome do Grupo"
        />

        {gruposFiltrados.length === 0 && filtro ? (
          <p style={{ marginTop: "20px" }}>Nenhum grupo encontrado com o termo "{filtro}".</p>
        ) : gruposFiltrados.length === 0 && !filtro ? (
          <p style={{ marginTop: "20px" }}>Nenhum grupo cadastrado.</p>
        ) : (
          <table className="tabela-geral" style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gruposPaginados.map((grupo, index) => (
                <tr key={grupo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{grupo.id}</td>
                  <td>{grupo.name}</td> 
                  <td>
                    <div className="botoes-acoes">
                      {/* *** ALTERADO: Botão de olho agora abre o modal *** */}

                        <button 
                          onClick={() => handleAbrirModalUsuarios(grupo)} 
                          title="Ver usuários do grupo" 
                          className="icone-botao">
                          <i className="bi bi-eye-fill icone-olho"></i>
                        </button>

                        {/* Link de Edição continua apontando para /grupos/:id */}
                        <BotaoEditar to={`/grupos/${grupo.id}`} />
                        
                        <BotaoExcluir onClick={() => {
                          setGrupoParaExcluir(grupo.id);
                          setMostrarPopupConfirmacao(true);
                        }} />

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {gruposFiltrados.length > 0 && (
            <Paginacao
              dados={gruposFiltrados} 
              paginaAtual={paginaAtual}
              setPaginaAtual={setPaginaAtual}
              itensPorPagina={itensPorPagina}
              onDadosPaginados={() => {}} 
            />
        )}

        <PopupConfirmacao
          show={mostrarPopupConfirmacao}
          mensagem="Tem certeza que deseja excluir este grupo?"
          onConfirm={confirmarExclusao}
          onCancel={() => setMostrarPopupConfirmacao(false)}
        />

        <PopupFeedback
          show={mostrarFeedback}
          mensagem={mensagemPopup}
          tipo={tipoMensagem}
          onClose={() => setMostrarFeedback(false)}
        />

        {/* *** NOVO: Renderizar o Modal de Visualização *** */}
        <VisualizarUsuariosGrupoModal 
          show={mostrarModalUsuarios}
          onClose={handleFecharModalUsuarios}
          grupo={grupoSelecionadoParaVer}
        />

        {/* Usando a navegação do último arquivo do usuário */}
        <BotaoVoltar onClick={() => navigate("/configuracoes")} /> 
      </main>
    </div>
  );
}


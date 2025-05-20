import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// COMPONENTES BASE
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import "./grupo.css"; // Certifique-se que este CSS existe ou remova se não for usado

// POPUPS
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../components/UI/paginacao";

// BOTÕES
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

// BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";

export default function ListarGrupos() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const itensPorPagina = 10;

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
    axios.delete(`http://localhost:8000/solicitacoes/grupos/${grupoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Grupo excluído com sucesso.");
        setTipoMensagem("sucesso");
        setGrupos(grupos.filter((g) => g.id !== grupoSelecionado));
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
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setGrupoSelecionado(null);
      });
  };

  return (
    <div>
      <HeaderCRE />
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
          <table className="tabela-cruds" style={{ marginTop: "20px" }}>
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
                      <Link to={`/grupos/${grupo.id}`} title="Ver detalhes" className="icone-botao">
                        <i className="bi bi-eye-fill icone-olho"></i>
                      </Link>
                      {/* Link de Edição CORRIGIDO */}
                      <Link to={`/grupos/${grupo.id}`} title="Editar" className="icone-botao">
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setGrupoSelecionado(grupo.id);
                          setMostrarPopup(true);
                        }}
                        title="Excluir"
                        className="icone-botao"
                      >
                        <i className="bi bi-trash3-fill icone-excluir"></i>
                      </button>
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
          show={mostrarPopup}
          mensagem="Tem certeza que deseja excluir este grupo?"
          onConfirm={confirmarExclusao}
          onCancel={() => setMostrarPopup(false)}
        />

        <PopupFeedback
          show={mostrarFeedback}
          mensagem={mensagemPopup}
          tipo={tipoMensagem}
          onClose={() => setMostrarFeedback(false)}
        />

        <BotaoVoltar onClick={() => navigate("/")} />
      </main>
      <Footer />
    </div>
  );
}


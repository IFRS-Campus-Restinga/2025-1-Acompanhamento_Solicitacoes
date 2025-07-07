import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// POPUPS
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../components/UI/paginacao";

// BOTÕES
import BotaoAnalisar from "../../components/UI/botoes/botao_analisar";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoDetalhar from "../../components/UI/botoes/botao_detalhar";
import BotaoEditar from "../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

//BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";

//CSS
import "../../components/styles/tabela.css";

export default function ListarUsuariosAtivos() { 
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null); 
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tipoAcao, setTipoAcao] = useState(""); // "excluir", "aprovar", "rejeitar"
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const navigate = useNavigate();
  const itensPorPagina = 10;

  // Função para buscar usuários
  const fetchUsuariosAtivos = () => {
    api.get("/usuarios/") 
      .then((res) => {
        setUsuarios(res.data);
        setPaginaAtual(1);
      })
      .catch((err) => {
        console.error("Erro ao carregar usuários:", err);
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar usuários."}`
        );
        setTipoMensagem("error");
        setMostrarFeedback(true);
      });
  };

  useEffect(() => {
    fetchUsuariosAtivos();
  }, []);

  // Função para buscar detalhes do usuário
  const fetchDetalhesUsuario = (usuario) => {
    setCarregandoDetalhes(true);
    api.get(`/usuarios/${usuario.id}/`)
      .then((res) => {
        setUsuarioSelecionado(res.data);
        setMostrarPopup(true);
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes do usuário:", err);
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar detalhes do usuário."}`
        );
        setTipoMensagem("error");
        setMostrarFeedback(true);
      })
      .finally(() => {
        setCarregandoDetalhes(false);
      });
  };

  // Função para filtrar usuários
  const filtrarUsuarios = () => {
    const termo = filtro.toLowerCase();
    return usuarios.filter((usuario) =>
        (usuario.nome || '').toLowerCase().includes(termo) ||
        (usuario.email || '').toLowerCase().includes(termo) ||
        (usuario.cpf || '').toLowerCase().includes(termo) ||
        (usuario.telefone || '').toLowerCase().includes(termo) ||
        (usuario.grupo || '').toLowerCase().includes(termo) ||
        (usuario.status_usuario || '').toLowerCase().includes(termo)
    );
  };
  const usuariosFiltrados = filtrarUsuarios();

  // Paginação
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Função unificada para lidar com confirmações
  const handleConfirmacao = (justificativa = null) => {
    if (!usuarioSelecionado) return;

    const usuarioId = usuarioSelecionado.id;

    switch (tipoAcao) {
      case "excluir":
        // Exclusão simples
        api.delete(`/usuarios/${usuarioId}/`)
          .then(() => {
            setMensagemPopup("Usuário excluído com sucesso.");
            setTipoMensagem("success");
            setUsuarios(prevUsuarios => prevUsuarios.filter((u) => u.id !== usuarioId));
          })
          .catch((err) => {
            console.error("Erro ao excluir usuário:", err);
            setMensagemPopup(
              `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir usuário."}`
            );
            setTipoMensagem("error");
          })
          .finally(() => {
            fecharPopup();
          });
        break;

      case "aprovar":
        // Aprovação de cadastro
        api.patch(`/usuarios/aprovar/${usuarioId}/`) 
          .then(() => {
            setMensagemPopup("Cadastro aprovado com sucesso!"); 
            setTipoMensagem("success");
            fetchUsuariosAtivos(); 
          })
          .catch((err) => {
            console.error("Erro ao aprovar cadastro:", err);
            setMensagemPopup(
              `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao aprovar cadastro."}`
            );
            setTipoMensagem("error");
          })
          .finally(() => {
            fecharPopup();
          });
        break;

      case "rejeitar":
        // Rejeição com justificativa
        const config = justificativa ? { data: { justificativa } } : {};
        api.delete(`/usuarios/${usuarioId}/`, config)
          .then(() => {
            setMensagemPopup("Cadastro rejeitado com sucesso."); 
            setTipoMensagem("success");
            setUsuarios(prevUsuarios => prevUsuarios.filter((u) => u.id !== usuarioId));
          })
          .catch((err) => {
            console.error("Erro ao rejeitar cadastro:", err);
            setMensagemPopup(
              `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao rejeitar cadastro."}`
            );
            setTipoMensagem("error");
          })
          .finally(() => {
            fecharPopup();
          });
        break;

      default:
        console.error("Tipo de ação não reconhecido:", tipoAcao);
        fecharPopup();
    }
  };

  // Função para fechar popup e limpar estados
  const fecharPopup = () => {
    setMostrarPopup(false);
    setMostrarFeedback(true);
    setUsuarioSelecionado(null);
    setTipoAcao("");
  };

  // Função para cancelar popup
  const cancelarPopup = () => {
    setMostrarPopup(false);
    setUsuarioSelecionado(null);
    setTipoAcao("");
  };

  // Função para abrir popup de exclusão
  const abrirPopupExclusao = (usuario) => {
    setUsuarioSelecionado(usuario);
    setTipoAcao("excluir");
    setMostrarPopup(true);
  };

  // Função para abrir popup de análise (aprovar/rejeitar)
  const abrirPopupAnalise = (usuario) => {
    setUsuarioSelecionado(usuario);
    setTipoAcao("aprovar");
    fetchDetalhesUsuario(usuario);
  };

  // Função para rejeitar cadastro
  const rejeitarCadastro = (justificativa) => {
    setTipoAcao("rejeitar");
    handleConfirmacao(justificativa);
  };

  // Determina as props do popup baseado no tipo de ação
  const getPopupProps = () => {
    switch (tipoAcao) {
      case "excluir":
        return {
          mensagem: "Tem certeza que deseja excluir este usuário?",
          confirmLabel: "Deletar",
          actionType: "delete",
          showRejectOption: false,
          showJustificativa: false,
          usuarioDetalhes: null
        };
      
      case "aprovar":
        return {
          mensagem: "Deseja aprovar ou rejeitar o cadastro?",
          confirmLabel: "Aprovar",
          actionType: "approve",
          showRejectOption: true,
          showJustificativa: false,
          usuarioDetalhes: usuarioSelecionado
        };
      
      default:
        return {
          mensagem: "Tem certeza que deseja continuar?",
          confirmLabel: "Confirmar",
          actionType: "default",
          showRejectOption: false,
          showJustificativa: false,
          usuarioDetalhes: null
        };
    }
  };

  const popupProps = getPopupProps();

  return (
    <div>
      <main className="container">
        <h2>Usuários</h2>

        <div className="botoes-wrapper">
          <BotaoCadastrar to="/usuarios/cadastro" title="Criar Novo Usuário" />
        </div>

        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
        />

        {carregandoDetalhes && (
          <div className="carregando-overlay">
            <p>Carregando detalhes do usuário...</p>
          </div>
        )}

        {usuariosFiltrados.length === 0 ? (
          <p><br />Nenhum usuário encontrado!</p>
        ) : (
          <table className="tabela-geral">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Grupo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((usuario, index) => (
                <tr key={usuario.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.cpf}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefone}</td>
                  <td>{usuario.grupo}</td>
                  <td>{usuario.status_usuario}</td>
                  <td>
                    <div className="botoes-acoes">
                      <BotaoDetalhar to={`/usuarios/${usuario.id}`} />

                      <BotaoEditar to={`/usuarios/editar/${usuario.grupo?.toLowerCase()}/${usuario.grupo_detalhes?.id || usuario.id}`} />
                      
                      <BotaoExcluir onClick={() => abrirPopupExclusao(usuario)} />
                
                      {usuario.status_usuario === "Em Analise" && (
                        <BotaoAnalisar onClick={() => abrirPopupAnalise(usuario)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Paginacao
          dados={usuariosFiltrados}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={itensPorPagina}
          onDadosPaginados={() => {}}
        />

        {/* Popup Simplificado */}
        <PopupConfirmacao
          show={mostrarPopup}
          mensagem={popupProps.mensagem}
          onConfirm={handleConfirmacao}
          onReject={rejeitarCadastro}
          onCancel={cancelarPopup}
          showRejectOption={popupProps.showRejectOption}
          confirmLabel={popupProps.confirmLabel}
          actionType={popupProps.actionType}
          usuarioDetalhes={popupProps.usuarioDetalhes}
          showJustificativa={popupProps.showJustificativa}
        />

        <PopupFeedback
          show={mostrarFeedback}
          mensagem={mensagemPopup}
          tipo={tipoMensagem}
          onClose={() => setMostrarFeedback(false)}
        />

        <BotaoVoltar onClick={() => navigate("/cre/gestao-sistema")} />
      </main>
    </div>
  );
}


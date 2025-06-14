import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import api from "../../services/api";

// POPUPS
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../components/UI/paginacao";

// BOTÕES
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoDetalhar from "../../components/UI/botoes/botao_detalhar";
import BotaoEditar from "../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

//BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";

export default function ListarUsuariosAtivos() { 
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null); 
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tipoAcao, setTipoAcao] = useState(""); // Para diferenciar entre exclusão e aprovação
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
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  };

  useEffect(() => {
    fetchUsuariosAtivos();
  }, []);

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

  // Função para confirmar exclusão
  const confirmarExclusao = (justificativa = null) => {
    if (!usuarioId) return;

    // Se tiver justificativa, envia como parâmetro na requisição
    const config = justificativa ? { data: { justificativa } } : {};

    api.delete(`/usuarios/${usuarioId}/`, config)
      .then(() => {
        setMensagemPopup(justificativa 
          ? "Cadastro rejeitado com sucesso." 
          : "Usuário excluído com sucesso."); 
        setTipoMensagem("sucesso");
        setUsuarios(prevUsuarios => prevUsuarios.filter((u) => u.id !== usuarioId));
      })
      .catch((err) => {
        console.error("Erro ao excluir usuário:", err);
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir usuário."}`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setUsuarioId(null);
        setTipoAcao("");
      });
  };

  // Função para aprovar cadastro de usuário
  const confirmarAprovacao = () => {
    if (!usuarioId) return;
    api.patch(`/usuarios/aprovar/${usuarioId}/`) 
      .then(() => {
        setMensagemPopup("Cadastro aprovado com sucesso!"); 
        setTipoMensagem("sucesso");
        fetchUsuariosAtivos(); 
      })
      .catch((err) => {
        console.error("Erro ao aprovar cadastro:", err);
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao aprovar cadastro."}`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setUsuarioId(null);
        setTipoAcao("");
      });
  };

  // Função para rejeitar cadastro (usando a mesma lógica de exclusão, mas com justificativa)
  const rejeitarCadastro = (justificativa) => {
    confirmarExclusao(justificativa);
  };

  // Função para lidar com a confirmação baseada no tipo de ação
  const handleConfirmacao = () => {
    if (tipoAcao === "excluir") {
      confirmarExclusao();
    } else if (tipoAcao === "aprovar") {
      confirmarAprovacao();
    }
  };

  return (
    <div>
      <HeaderCRE />
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

        {usuariosFiltrados.length === 0 ? (
          <p><br />Nenhum usuário encontrado!</p>
        ) : (
          <table className="tabela-cruds">
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
                      
                      <BotaoExcluir onClick={() => {
                        setUsuarioId(usuario.id);
                        setTipoAcao("excluir");
                        setMostrarPopup(true);
                      }} />
                
                      {usuario.status_usuario === "Em Analise" && (
                        // Botão Analisar com texto e cor personalizada
                        <button
                          onClick={() => {
                            setUsuarioId(usuario.id)
                            setTipoAcao("aprovar");
                            setMostrarPopup(true); 
                          }}
                          title="Analisar Cadastro"
                          className="botao-analisar"
                        >
                          Analisar
                        </button>
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

        <PopupConfirmacao
          show={mostrarPopup}
          // Define a mensagem com base no tipo de ação
          mensagem={tipoAcao === "excluir" 
            ? "Tem certeza que deseja excluir este usuário?" 
            : "Deseja aprovar ou rejeitar o cadastro?"}
          onConfirm={handleConfirmacao} // Chama a função que decide qual ação executar
          onReject={rejeitarCadastro} // Nova função para rejeitar cadastro
          onCancel={() => {
            setMostrarPopup(false);
            setUsuarioId(null);
            setTipoAcao("");
          }}
          // Exibe opção de rejeição apenas quando estamos analisando um cadastro
          showRejectOption={tipoAcao === "aprovar"}
          // Define o texto do botão de confirmação com base no tipo de ação
          confirmLabel={tipoAcao === "aprovar" ? "Aprovar" : "Confirmar"}
        />

        <PopupFeedback
          show={mostrarFeedback}
          mensagem={mensagemPopup}
          tipo={tipoMensagem}
          onClose={() => setMostrarFeedback(false)}
        />

        <BotaoVoltar onClick={() => navigate("/configuracoes")} />
      </main>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";

// POPUPS
import PopupFeedback from "../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../components/UI/paginacao";

// BOTÕES
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

//BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";

export default function ListarUsuariosInativos() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const navigate = useNavigate();
  const itensPorPagina = 10;

  // Função para buscar usuários inativos
  const fetchUsuariosInativos = () => {
    api.get("/usuarios/inativos/") 
      .then((res) => {
        setUsuarios(res.data);
        setPaginaAtual(1); 
      })
      .catch((err) => {
        console.error("Erro ao carregar usuários inativos:", err);
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar usuários inativos."}`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  };

  useEffect(() => {
    fetchUsuariosInativos();
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

  // Função para reativar usuário
  const handleReativarUsuario = (usuarioId) => {
    const reativarUrl = `/usuarios/inativos/${usuarioId}/`;

    api.patch(reativarUrl)
      .then(() => {
        setMensagemPopup("Usuário reativado com sucesso!");
        setTipoMensagem("sucesso");
        // Remove o usuário da lista de inativos no frontend
        setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== usuarioId));
        // Opcional: Atualizar a contagem total ou forçar recarregamento se necessário
      })
      .catch((err) => {
        console.error("Erro ao reativar usuário:", err);
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao reativar usuário."}`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarFeedback(true);
      });
  };

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <h2>Usuários Inativos</h2>
         
        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1); // Reseta paginação ao filtrar
          }}
        />

        {usuariosFiltrados.length === 0 ? (
          <p><br />Nenhum usuário inativo encontrado!</p>
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
                      {/* Botão Visualizar Detalhes */}
                      <Link to={`/usuarios/${usuario.id}`} title="Ver detalhes">
                        <i className="bi bi-eye-fill icone-olho"></i>
                      </Link>
                      {/* Botão Reativar Usuário */}
                      <button
                        onClick={() => handleReativarUsuario(usuario.id)}
                        title="Reativar Usuário"
                        className="icone-botao"
                      >
                        {/* Use um ícone apropriado, ex: bi-arrow-clockwise, bi-person-check-fill */}
                        <i className="bi bi-arrow-clockwise icone-reativar"></i>
                      </button>
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
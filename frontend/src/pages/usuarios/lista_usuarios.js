import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";

// POPUPS
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../components/UI/paginacao";

// BOTÕES
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [termoBusca, setTermoBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [exibirInativos, setExibirInativos] = useState(false);
  const navigate = useNavigate();
  const itensPorPagina = 10;

  useEffect(() => {
    const url = exibirInativos
      ? "http://localhost:8000/solicitacoes/usuarios/inativos/"
      : "http://localhost:8000/solicitacoes/usuarios/";

    axios
      .get(url)
      .then((res) => {
        setUsuarios(res.data);
        setPaginaAtual(1);
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar usuários."}`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, [exibirInativos]);

  const filtrarUsuarios = () => {
    const termo = termoBusca.toLowerCase();
    return usuarios.filter((usuario) =>
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      usuario.cpf.toLowerCase().includes(termo) ||
      usuario.telefone.toLowerCase().includes(termo) ||
      usuario.data_nascimento.toLowerCase().includes(termo) ||
      usuario.papel.toLowerCase().includes(termo)
    );
  };

  const usuariosFiltrados = filtrarUsuarios();

  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/usuarios/${usuarioSelecionado}/`)
      .then(() => {
        setMensagemPopup("Usuário excluído com sucesso.");
        setTipoMensagem("sucesso");
        setUsuarios(usuarios.filter((u) => u.id !== usuarioSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir usuário."}`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setUsuarioSelecionado(null);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Usuários</h2>

        <div className="botoes-wrapper">
          <div className="botao-cadastrar-wrapper">
            <Link to="/usuarios/cadastrar" className="botao-link" title="Criar Novo Usuário">
              <button className="botao-cadastrar">
                <i className="bi bi-plus-circle-fill"></i>
              </button>
            </Link>
          </div>

          <div className="botao-inativos-wrapper">
            <button
              onClick={() => setExibirInativos(!exibirInativos)}
              className="btn btn-secondary"
            >
              {exibirInativos ? "Mostrar Ativos" : "Mostrar Inativos"}
            </button>
          </div>
        </div>

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={termoBusca}
            onChange={(e) => {
              setTermoBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="input-pesquisa"
          />
        </div>

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
                <th>Data de Nascimento</th>
                <th>Papel</th>
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
                  <td>{usuario.data_nascimento}</td>
                  <td>{usuario.papel}</td>
                  <td>
                    <div className="botoes-acoes">
                      <Link to={`/usuarios/${usuario.id}`} title="Ver detalhes">
                        <i className="bi bi-eye-fill icone-olho"></i>
                      </Link>
                      <Link to={`/usuarios/editar/${usuario.id}`} title="Editar">
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setUsuarioSelecionado(usuario.id);
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

        <Paginacao
          dados={usuariosFiltrados}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={itensPorPagina}
          onDadosPaginados={() => {}}
        />

        <PopupConfirmacao
          show={mostrarPopup}
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

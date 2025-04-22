import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import "./usuarios.css";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [termoBusca, setTermoBusca] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/usuarios/")
      .then((res) => setUsuarios(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar usuários."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const handleBusca = (e) => setTermoBusca(e.target.value);

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

  
  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/usuarios/${usuarioSelecionado}/`)
      .then(() => {
        setMensagemPopup("Usuário excluído com sucesso.");
        setTipoMensagem("sucesso");
        setUsuarios(usuarios.filter((d) => d.codigo !== usuarioSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir usuário."}`);
        setTipoMensagem("erro");
      })
  };

  const usuariosFiltrados = filtrarUsuarios();

  return (
    <div>
      <Header />
      <main className="container">
        <div className="conteudo-tabela">
          <h2>Usuários</h2>
          <div className="input-group w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar"
              value={termoBusca}
              onChange={handleBusca}
            />
          </div>
          <div className="botao-cadastrar-wrapper">
            <Link to="/usuarios/cadastrar" className="botao-link" title="Criar Novo Usuario">
              <button className="botao-cadastrar">
                <i className="bi bi-plus-circle-fill"></i>
              </button>
            </Link>
          </div>

          {usuariosFiltrados.length === 0 ? (
            <p><br />Nenhum usuário encontrado!</p>
          ) : (
            <table className="tabela-usuarios">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Data de Nascimento</th>
                  <th>Tipo Usuario</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario, index) => [
                  <tr key={`usuario-${usuario.id}`} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.cpf}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.telefone}</td>
                    <td>{usuario.data_nascimento}</td>
                    <td>{usuario.papel}</td>
                    <td>
                      <div className="botoes-acoes">
                      <Link to={`/usuarios/${usuario.id}`} className="botao-icone" title="Ver detalhes">
                        <i className="bi bi-eye-fill"></i>
                      </Link>
                      </div>
                    </td>
                  </tr>
                ])}
              </tbody>
            </table>
          )}
        </div>

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

        <div className="botao-voltar-wrapper">
          <button className="botao-voltar" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
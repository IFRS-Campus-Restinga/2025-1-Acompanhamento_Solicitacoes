import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./lista_usuarios.css";
import PopupConfirmacao from "./popup_confirmacao";
import PopupFeedback from "./popup_feedback";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosDetalhesVisiveis, setUsuariosDetalhesVisiveis] = useState([]);
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

  const toggleDetalhesUsuario = (id) => {
    setUsuariosDetalhesVisiveis((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
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
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setUsuarioSelecionado(null);
      });
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

          {usuariosFiltrados.length === 0 ? (
            <p><br />Nenhum usuário encontrado!</p>
          ) : (
            <table className="tabela-usuarios">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Data de Nascimento</th>
                  <th>Papel</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario, index) => [
                  <tr key={`usuario-${usuario.id}`} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nome}</td>
                    <td>{usuario.cpf}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.telefone}</td>
                    <td>{usuario.data_nascimento}</td>
                    <td>{usuario.papel}</td>
                    <td>
                      <span style={{ color: usuario.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                        {usuario.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="botoes-acoes">
                        <button
                          title={usuariosDetalhesVisiveis.includes(usuario.id) ? "Fechar detalhes" : "Ver detalhes"}
                          onClick={() => toggleDetalhesUsuario(usuario.id)}
                          className="botao-icone"
                        >
                          <i className={`bi ${usuariosDetalhesVisiveis.includes(usuario.id) ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>,

                  usuariosDetalhesVisiveis.includes(usuario.id) && (
                    <tr key={`detalhes-${usuario.id}`} className="linha-detalhes">
                      <td colSpan="9">
                        <table className="tabela-detalhes">
                          <tbody>
                            {usuario.papel === "Coordenador" && (
                              <>
                                <tr><td><strong>SIAPE:</strong> {usuario.papel_detalhes?.siape}</td></tr>
                                <tr><td><strong>Início do Mandato:</strong> {usuario.papel_detalhes?.inicio_mandato}</td></tr>
                                <tr><td><strong>Fim do Mandato:</strong> {usuario.papel_detalhes?.fim_mandato}</td></tr>
                                <tr><td><strong>Curso:</strong> {usuario.papel_detalhes?.curso}</td></tr>
                              </>
                            )}
                            {usuario.papel === "CRE" && (
                              <tr><td><strong>SIAPE:</strong> {usuario.papel_detalhes?.siape}</td></tr>
                            )}
                            {usuario.papel === "Aluno" && (
                              <>
                                <tr><td><strong>Matrícula:</strong> {usuario.papel_detalhes?.matricula}</td></tr>
                                <tr><td><strong>Turma:</strong> {usuario.papel_detalhes?.turma}</td></tr>
                                <tr><td><strong>Ano de Ingresso:</strong> {usuario.papel_detalhes?.ano_ingresso}</td></tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )
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
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";

// Componentes UI
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import Paginacao from "../../components/UI/paginacao";
import BarraPesquisa from "../../components/UI/barra_pesquisa";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function ListarDisponibilidades() {
  const navigate = useNavigate();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/disponibilidades/")
      .then((res) => setDisponibilidades(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar disponibilidades."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/disponibilidades/${idSelecionado}/`)
      .then(() => {
        setMensagemPopup("Disponibilidade excluída com sucesso.");
        setTipoMensagem("sucesso");
        setDisponibilidades(disponibilidades.filter((d) => d.id !== idSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir disponibilidade."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setIdSelecionado(null);
      });
  };

  const disponibilidadesFiltradas = React.useMemo(() => {
    if (!filtro) return disponibilidades;
    
    const termo = filtro.toLowerCase();
    return disponibilidades.filter((disponibilidade) => {
      return (
        (disponibilidade.nome_formulario?.toLowerCase() || "").includes(termo) ||
        (disponibilidade.formulario?.toLowerCase() || "").includes(termo)
      );
    });
  }, [disponibilidades, filtro]);

  const itensPorPagina = 5;
  const dadosPaginados = disponibilidadesFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Disponibilidade de Formulários</h2>

        <BotaoCadastrar to="/disponibilidades/cadastrar" title="Cadastrar Nova Disponibilidade" />

        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
          placeholder="Pesquisar por formulário"
        />

        {disponibilidadesFiltradas.length === 0 ? (
          <p><br />Nenhuma disponibilidade encontrada!</p>
        ) : (
          <table className="tabela-cruds">
            <thead>
              <tr>
                <th>Formulário</th>
                <th>Disponibilidade</th>
                <th>Período</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((disponibilidade, index) => (
                <tr key={disponibilidade.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{disponibilidade.nome_formulario}</td>
                  <td>
                    {disponibilidade.sempre_disponivel ? 
                      "Sempre disponível" : 
                      "Por período"}
                  </td>
                  <td>
                    {disponibilidade.sempre_disponivel ? 
                      "-" : 
                      `${new Date(disponibilidade.data_inicio).toLocaleDateString()} a ${new Date(disponibilidade.data_fim).toLocaleDateString()}`}
                  </td>
                  <td>
                    <span className={`status ${disponibilidade.esta_ativo ? 'ativo' : 'inativo'}`}>
                      {disponibilidade.esta_ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="botoes-acoes">
                      <Link to={`/disponibilidades/${disponibilidade.id}`} title="Editar">
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setIdSelecionado(disponibilidade.id);
                          setMostrarPopup(true);
                        }}
                        title="Excluir"
                        className="icone-botao">
                        <i className="bi bi-trash3-fill icone-excluir"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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

        {disponibilidadesFiltradas.length > 0 && (
          <Paginacao
            dados={disponibilidadesFiltradas}
            paginaAtual={paginaAtual}
            setPaginaAtual={setPaginaAtual}
            itensPorPagina={itensPorPagina}
            onDadosPaginados={() => {}}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
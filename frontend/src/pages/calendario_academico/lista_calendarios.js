import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import Paginacao from "../../components/UI/paginacao";

//BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";
//BOTÕES
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function ListarCalendarios() {
  const navigate = useNavigate();
  const [calendarios, setCalendarios] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [codigoSelecionado, setCodigoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/calendarios/")
      .then((res) => setCalendarios(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar calendários."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/calendarios/${codigoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Calendário excluído com sucesso.");
        setTipoMensagem("sucesso");
        setCalendarios(calendarios.filter((c) => c.codigo !== codigoSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir calendário."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setCodigoSelecionado(null);
      });
  };

  // Filtro em tempo real (seguro e eficiente)
  const calendariosFiltrados = React.useMemo(() => {
    if (!filtro) return calendarios; // Retorna tudo se não houver filtro
    
    const termo = filtro.toLowerCase();
    return calendarios.filter((calendario) => {
      return (
        (calendario.codigo?.toLowerCase() || "").includes(termo) ||
        (calendario.nome_formulario?.toLowerCase() || "").includes(termo) ||
        (calendario.nome_tipo_curso?.toLowerCase() || "").includes(termo)
      );
    });
  }, [calendarios, filtro]); // Recalcula apenas quando `calendarios` ou `filtro` mudam

  const itensPorPagina = 5;

  const dadosPaginados = calendariosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Calendários Acadêmicos</h2>

        <BotaoCadastrar to="/calendarios/cadastrar" title="Criar Novo Calendário" />

        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
          placeholder="Pesquisar por código ou tipo de formulário"
        />

        {calendariosFiltrados.length === 0 ? (
          <p><br />Nenhum calendário encontrado!</p>
        ) : (
          <table className="tabela-cruds">
            <thead>
              <tr>
                <th>Código</th>
                <th>Formulário</th>
                <th>Tipo de Curso</th>
                <th>Período</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((calendario, index) => (
                <tr key={calendario.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{calendario.codigo}</td>
                  <td>{calendario.nome_formulario}</td> {/* Campo corrigido */}
                  <td>{calendario.nome_tipo_curso}</td> {/* Campo corrigido */}
                  <td>
                    {new Date(calendario.data_inicio).toLocaleDateString()} a {' '}
                    {new Date(calendario.data_fim).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`status ${calendario.esta_ativo ? 'ativo' : 'inativo'}`}>
                      {calendario.esta_ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="botoes-acoes">
                      <Link to={`/calendarios/${calendario.codigo}`} title="Editar">
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setCodigoSelecionado(calendario.codigo);
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

        <Paginacao
          dados={calendariosFiltrados}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={itensPorPagina}
          onDadosPaginados={() => {}}
        />
      </main>
      <Footer />
    </div>
  );
}
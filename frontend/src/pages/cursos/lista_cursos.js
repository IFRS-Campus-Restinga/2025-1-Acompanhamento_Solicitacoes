import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import Paginacao from "../../components/UI/paginacao";

export default function ListarCursos() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [cursosPaginados, setCursosPaginados] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/cursos/")
      .then((res) => {
        const cursosOrdenados = res.data.sort((a, b) => a.codigo.localeCompare(b.codigo));
        setCursos(cursosOrdenados);
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao carregar cursos."
          }`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios
      .delete(`http://localhost:8000/solicitacoes/cursos/${cursoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Curso excluído com sucesso.");
        setTipoMensagem("sucesso");
        setCursos(cursos.filter((c) => c.codigo !== cursoSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao excluir curso."
          }`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setCursoSelecionado(null);
      });
  };

  const cursosFiltrados = useMemo(
    () =>
      cursos.filter(
        (curso) =>
          curso.nome.toLowerCase().includes(filtro.toLowerCase()) ||
          curso.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
          (curso.tipo_periodo && curso.tipo_periodo.toLowerCase().includes(filtro.toLowerCase()))
      ),
    [cursos, filtro]
  );

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <h2>Cursos</h2>

        <BotaoCadastrar to="/cursos/cadastrar" title="Criar Novo Curso" />

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar por nome, código ou tipo de período..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-pesquisa"
          />
        </div>

        <table className="tabela-cruds">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Tipo de Período</th>
              <th>PPCs</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursosPaginados.map((curso, index) => (
              <tr key={curso.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{curso.codigo}</td>
                <td>{curso.nome}</td>
                <td>{curso.tipo_periodo || 'Semestral'}</td>
                <td>{curso.ppcs ? curso.ppcs.join(", ") : ""}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/cursos/${curso.codigo}`} title="Editar">
                      <i className="bi bi-pencil-square icone-editar"></i>
                    </Link>
                    <button
                      onClick={() => {
                        setCursoSelecionado(curso.codigo);
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

        <Paginacao
          dados={cursosFiltrados}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={5}
          onDadosPaginados={setCursosPaginados}
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

        <BotaoVoltar onClick={() => navigate("/configuracoes")} />
      </main>
      <Footer />
    </div>
  );
}
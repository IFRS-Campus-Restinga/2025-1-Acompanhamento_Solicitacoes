import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

//Components
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import Paginacao from "../../components/UI/paginacao";

//Botões
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoEditar from "../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

//CSS
import "../../components/styles/tabela.css";

export default function ListarPpc() {
  const navigate = useNavigate();
  const [ppcs, setPpcs] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [ppcSelecionado, setPpcSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ppcsPaginados, setPpcsPaginados] = useState([]);

  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/ppcs/")
      .then((res) => setPpcs(res.data))
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao carregar PPCs."
          }`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios
      .delete(`http://localhost:8000/solicitacoes/ppcs/${ppcSelecionado}/`)
      .then(() => {
        setMensagemPopup("PPC excluído com sucesso.");
        setTipoMensagem("sucesso");
        setPpcs(ppcs.filter((p) => p.codigo !== ppcSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao excluir PPC."
          }`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setPpcSelecionado(null);
      });
  };

  const ppcsFiltrados = useMemo(() => 
    ppcs.filter(ppc =>
      ppc.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      (ppc.curso && ppc.curso.toLowerCase().includes(filtro.toLowerCase()))
    ), 
    [ppcs, filtro]
  );
  

  return (
    <div>
      <main className="container">
        <h2>PPCs</h2>

        <BotaoCadastrar to="/ppcs/cadastrar" title="Criar Novo PPC" />

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar por código ou curso..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-pesquisa"
          />
        </div>

        <table className="tabela-geral">
          <thead>
            <tr>
              <th>Código</th>
              <th>Curso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ppcsPaginados.map((ppc, index) => (
              <tr key={ppc.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{ppc.codigo}</td>
                <td>{ppc.curso_details.nome}</td>
                <td>
                  <div className="botoes-acoes">

                    <BotaoEditar to={`/ppcs/${encodeURIComponent(ppc.codigo)}`} />
                    
                    <BotaoExcluir onClick={() => {
                      setPpcSelecionado(ppc.codigo);
                      setMostrarPopup(true);
                    }} />

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Paginacao
          dados={ppcsFiltrados}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={5}
          onDadosPaginados={setPpcsPaginados}
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
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

//CSS
import "../../../components/formulario.css";
import "../../../components/layout-cruds.css";
import "../../../components/tabela-cruds.css";

//COMPONENTS
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import Paginacao from "../../../components/UI/paginacao";


const MinhasSolicitacoesAluno = () => {
     const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [solicitacoesPaginadas, setSolicitacoesPaginadas] = useState([]);
  const [filtro, setFiltro] = useState("");

  const carregarSolicitacoes = () => {
    console.log("➡️ Requisitando todas-solicitacoes...");
    api
      .get("todas-solicitacoes")
      .then((res) => {
        console.log("✅ Resposta recebida:", res.data);
        setSolicitacoes(res.data);
      })
      .catch((error) => {
        console.error("❌ Erro ao buscar solicitações:", error);
      });
  };

  useEffect(() => {
    carregarSolicitacoes();

    // Se você usar sessionStorage para controlar retorno de cadastro:
    if (sessionStorage.getItem("voltarDoCadastro")) {
      carregarSolicitacoes();
      sessionStorage.removeItem("voltarDoCadastro");
    }
  }, []);

  const confirmarExclusao = () => {
    api
      .delete(`todas-solicitacoes/${idSelecionado}/`)
      .then(() => {
        setMensagemPopup("Solicitação excluída com sucesso.");
        setTipoMensagem("sucesso");
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao excluir solicitação."
          }`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setIdSelecionado(null);
        carregarSolicitacoes(); // Recarrega após exclusão
      });
  };

  const solicitacoesFiltradas = useMemo(
    () =>
      solicitacoes.filter(
        (s) =>
          s.tipo?.toLowerCase().includes(filtro.toLowerCase()) ||
          s.status?.toLowerCase().includes(filtro.toLowerCase())
      ),
    [solicitacoes, filtro]
  );

     const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    return (
        <div>
            <HeaderAluno />
             <main className="container">
                <h2>Solicitações</h2>

                <div className="barra-pesquisa">
                <i className="bi bi-search icone-pesquisa"></i>
                <input
                    type="text"
                    placeholder="Buscar por tipo ou status..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="input-pesquisa"
                />
                </div>

                <table className="tabela-cruds tabela-solicitacoes">
                <thead>
                    <tr>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Posse</th>
                    <th>Ações</th>
                    </tr>

                </thead>
                <tbody>
                    {solicitacoesPaginadas.map((solicitacao, index) => (
                    <tr key={solicitacao.id}className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                        
                        <td>{solicitacao.tipo}</td>
                        <td>
                            <span className={`status-badge ${solicitacao.status.toLowerCase().replace(' ', '-')}`}>
                                {solicitacao.status}
                            </span>
                        </td>
                        <td className="coluna-data">{formatarData(solicitacao.data_solicitacao)}</td>
                        <td>{solicitacao.posse_solicitacao}</td>
                        
                        {/*   to={`/solicitacoes/${solicitacao.id}`}  */}
                        <td>
                            <div className="botoes-acoes">
                               <Link 
                                    to={`/aluno/detalhes-solicitacao/${solicitacao.id}`} 
                                    className="btn-detalhes"
                                    title="Ver detalhes">
                                    <i className="bi bi-eye-fill"></i>
                                </Link>
                                <button
                                    onClick={() => {
                                        setIdSelecionado(solicitacao.id);
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

                <Paginacao
                dados={solicitacoesFiltradas}
                paginaAtual={paginaAtual}
                setPaginaAtual={setPaginaAtual}
                itensPorPagina={5}
                onDadosPaginados={setSolicitacoesPaginadas}
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
                
            </main>
            <Footer />
        </div>
    );
};

export default MinhasSolicitacoesAluno;

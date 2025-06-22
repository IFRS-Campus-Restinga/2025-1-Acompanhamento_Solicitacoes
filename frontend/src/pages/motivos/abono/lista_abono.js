import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../../components/UI/paginacao";

//BARRA PESQUISA
import BarraPesquisa from "../../../components/UI/barra_pesquisa";
//BOTÕES
import BotaoCadastrar from "../../../components/UI/botoes/botao_cadastrar";
import BotaoEditar from "../../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

//CSS
import "../../../components/styles/tabela.css";

export default function ListarMotivosAbono() {
  const navigate = useNavigate();
  const [motivos, setMotivos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((res) => setMotivos(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar motivos."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  // Resetar página quando filtro muda
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro]);

  // Filtrar motivos com useMemo
  const motivosFiltrados = useMemo(() =>
    motivos.filter((motivo) =>
      motivo.descricao.toLowerCase().includes(filtro.toLowerCase()) ||
      motivo.tipo_falta.toLowerCase().includes(filtro.toLowerCase())
    ), [motivos, filtro]);

  // Dados da página atual com useMemo
  const dadosPaginados = useMemo(() =>
    motivosFiltrados.slice(
      (paginaAtual - 1) * itensPorPagina,
      paginaAtual * itensPorPagina
    ), [motivosFiltrados, paginaAtual, itensPorPagina]);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/motivo_abono/${motivoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Motivo excluído com sucesso.");
        setTipoMensagem("sucesso");
        setMotivos(motivos.filter((m) => m.id !== motivoSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir motivo."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setMotivoSelecionado(null);
      });
  };

  return (
    <div>
      <main className="container">
        <h2>Motivos de Abono</h2>

        {/* Botão de cadastrar */}
        <BotaoCadastrar to="/motivo_abono/cadastrar" title="Criar Novo Motivo" />

        {/* Barra de pesquisa */}
        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
        />

        {motivosFiltrados.length === 0 ? (
          <p className="mt-4">Nenhum motivo encontrado.</p>
        ) : (
          <table className="tabela-geral">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo de Falta</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((motivo, index) => (
                <tr key={motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td className="descricao">{motivo.descricao}</td>
                  <td>{motivo.tipo_falta}</td>
                  <td>
                    <div className="botoes-acoes">

                      <BotaoEditar to={`/motivo_abono/${motivo.id}`} />
                      
                      <BotaoExcluir onClick={() => {
                        setMotivoSelecionado(motivo.id);
                        setMostrarPopup(true);
                      }} />

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {motivosFiltrados.length > itensPorPagina && (
          <Paginacao
            dados={motivosFiltrados}
            paginaAtual={paginaAtual}
            setPaginaAtual={setPaginaAtual}
            itensPorPagina={itensPorPagina}
            onDadosPaginados={() => {}}
          />
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

        <BotaoVoltar onClick={() => navigate("/configuracoes")} />
          
      </main>
    </div>
  );
}

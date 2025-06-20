import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import Paginacao from "../../components/UI/paginacao";

//BARRA PESQUISA
import BarraPesquisa from "../../components/UI/barra_pesquisa";
//BOTÕES
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoEditar from "../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function ListarTurmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1); // Estado da página

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/turmas/")
      .then((res) => setTurmas(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar turmas."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/turmas/${turmaSelecionada}/`)
      .then(() => {
        setMensagemPopup("Turma excluída com sucesso.");
        setTipoMensagem("sucesso");
        setTurmas(turmas.filter((t) => t.id !== turmaSelecionada));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir turma."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setTurmaSelecionada(null);
      });
  };

  const turmasFiltradas = turmas.filter((turma) =>
    turma.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const itensPorPagina = 5;
  const totalPaginas = Math.ceil(turmasFiltradas.length / itensPorPagina);

  const dadosPaginados = turmasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <h2>Turmas</h2>

        {/* Botão de cadastrar */}
        <BotaoCadastrar to="/turmas/cadastrar" title="Criar Nova Turma" />

        {/* Barra de pesquisa */}
        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
        />

        {turmasFiltradas.length === 0 ? (
          <p><br />Nenhuma turma encontrada!</p>
        ) : (
          <table className="tabela-cruds">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Disciplinas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((turma, index) => (
                <tr key={turma.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{turma.nome}</td>
                  <td>
                    {turma.disciplinas?.length
                      ? turma.disciplinas.map(d => d.nome).join(", ")
                      : "Nenhuma disciplina atribuída"}
                  </td>
                  <td>
                    <div className="botoes-acoes">
                      
                      <BotaoEditar to={`/turmas/${turma.id}`} />

                      <BotaoExcluir onClick={() => {
                        setTurmaSelecionada(turma.id);
                        setMostrarPopup(true);
                      }} />

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

        <BotaoVoltar onClick={() => navigate("/configuracoes")} />

        <Paginacao
          dados={turmasFiltradas}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={itensPorPagina}
          onDadosPaginados={() => {}} // Apenas para compatibilidade
        />
      </main>
      <Footer />
    </div>
  );
}
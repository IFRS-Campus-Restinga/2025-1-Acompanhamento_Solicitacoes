import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function ListarDisciplinas() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1); // Estado para controlar a página atual

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/disciplinas/")
      .then((res) => setDisciplinas(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar disciplinas."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/disciplinas/${disciplinaSelecionada}/`)
      .then(() => {
        setMensagemPopup("Disciplina excluída com sucesso.");
        setTipoMensagem("sucesso");
        setDisciplinas(disciplinas.filter((d) => d.codigo !== disciplinaSelecionada)); // Exclui pela disciplinaSelecionada.codigo
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir disciplina."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setDisciplinaSelecionada(null);
      });
  };

  const disciplinasFiltradas = disciplinas.filter((disciplina) =>
    disciplina.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const itensPorPagina = 5; // Número de itens por página
  

  // Dados paginados
  const dadosPaginados = disciplinasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div>
      <main className="container">
        <h2>Disciplinas</h2>

        {/* Botão de cadastrar */}
        <BotaoCadastrar to="/disciplinas/cadastrar" title="Criar Nova Disciplina" />

        {/* Barra de pesquisa */}
        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
        />

        {disciplinasFiltradas.length === 0 ? (
          <p><br />Nenhuma disciplina encontrada!</p>
        ) : (
          <table className="tabela-cruds">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Período</th>
                <th>PPC</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((disciplina, index) => (
                <tr key={disciplina.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{disciplina.codigo}</td>
                  <td>{disciplina.nome}</td>
                  <td>{disciplina.periodo}</td>
                  <td>
                    {disciplina.ppc ? disciplina.ppc : "Nenhum PPC atribuído"}
                  </td>
                  <td>
                    <div className="botoes-acoes">
  
                      <BotaoEditar to={`/disciplinas/${disciplina.codigo}`} />

                      <BotaoExcluir onClick={() => {
                        setDisciplinaSelecionada(disciplina.codigo); // Armazenando o código da disciplina
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
          dados={disciplinasFiltradas}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={itensPorPagina}
          onDadosPaginados={() => {}}
        />
      </main>
    </div>
  );
}
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react"; // Adicionado useMemo aqui
import { useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import { format, parseISO } from 'date-fns'; // Importado para formatação de datas

// Componentes UI
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BarraPesquisa from "../../components/UI/barra_pesquisa";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoEditar from "../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import Paginacao from "../../components/UI/paginacao";

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

  // Função para carregar as disponibilidades
  const carregarDisponibilidades = () => {
    axios.get("http://localhost:8000/solicitacoes/disponibilidades/")
      .then((res) => setDisponibilidades(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar disponibilidades."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  };

  useEffect(() => {
    carregarDisponibilidades();
  }, []); // Carrega ao montar o componente

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/disponibilidades/${idSelecionado}/`) // Garante a barra final
      .then(() => {
        setMensagemPopup("Disponibilidade excluída com sucesso.");
        setTipoMensagem("sucesso");
        carregarDisponibilidades(); // Recarrega a lista após exclusão
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

  const disponibilidadesFiltradas = useMemo(() => {
    if (!filtro) return disponibilidades;
    
    const termo = filtro.toLowerCase();
    return disponibilidades.filter((disponibilidade) => {
      // Ajustado para usar nome_formulario ou o próprio formulario
      const nomeFormulario = disponibilidade.nome_formulario?.toLowerCase() || "";
      const formularioValue = disponibilidade.formulario?.toLowerCase() || "";

      return nomeFormulario.includes(termo) || formularioValue.includes(termo);
    });
  }, [disponibilidades, filtro]);

  const itensPorPagina = 5;
  const dadosPaginados = disponibilidadesFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <h2>Disponibilidade de Formulários</h2>

        <BotaoCadastrar to="/disponibilidades/cadastrar" title="Cadastrar Nova Disponibilidade" />

        <BarraPesquisa
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1); // Volta para a primeira página ao pesquisar
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
                <th>Tipo de Disponibilidade</th> {/* Coluna renomeada para clareza */}
                <th>Períodos Cadastrados</th> {/* Coluna renomeada para clareza */}
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
                      "Por período(s)"} {/* Exibe "Por período(s)" para múltiplos */}
                  </td>
                  <td>
                    {disponibilidade.sempre_disponivel
                      ? (disponibilidade.periodos?.[0]?.data_inicio
                          ? `A partir de ${format(parseISO(disponibilidade.periodos[0].data_inicio), 'dd/MM/yyyy')}`
                          : 'Data inicial não definida' // Caso muito raro se sempre_disponivel for true
                        )
                      : (disponibilidade.periodos?.length > 0
                          ? disponibilidade.periodos.map(p =>
                              `${format(parseISO(p.data_inicio), 'dd/MM/yyyy')} a ${p.data_fim ? format(parseISO(p.data_fim), 'dd/MM/yyyy') : 'Indefinido'}`
                            ).join(' | ')
                          : "Nenhum período cadastrado" // Caso onde não é sempre_disponivel e não há períodos
                        )
                    }
                  </td>
                  <td>
                    <span className={`status ${disponibilidade.esta_ativo ? 'ativo' : 'inativo'}`}>
                      {disponibilidade.esta_ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="botoes-acoes">
                      <BotaoEditar to={`/disponibilidades/${disponibilidade.id}`} />
                      <BotaoExcluir onClick={() => {
                        setIdSelecionado(disponibilidade.id);
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

        {disponibilidadesFiltradas.length > 0 && (
          <Paginacao
            dados={disponibilidadesFiltradas}
            paginaAtual={paginaAtual}
            setPaginaAtual={setPaginaAtual}
            itensPorPagina={itensPorPagina}
            onDadosPaginados={() => {}} // Função vazia, pois os dados são paginados via slice
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
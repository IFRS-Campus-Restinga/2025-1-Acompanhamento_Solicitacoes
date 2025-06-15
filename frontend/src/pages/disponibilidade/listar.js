import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import { format, parseISO, isWithinInterval } from 'date-fns'; // Adicionado isWithinInterval

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
  // Renomeado para 'itemParaAcao', pois pode ser um período ou uma disponibilidade
  const [itemParaAcao, setItemParaAcao] = useState(null); // Agora armazena um objeto com id e tipo
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Mapeamento para nomes amigáveis dos formulários
  const FORMULARIO_LABELS = {
    TRANCAMENTODISCIPLINA: "Trancamento de Disciplina",
    TRANCAMENTOMATRICULA: "Trancamento de Matrícula",
    DISPENSAEDFISICA: "Dispensa de Educação Física",
    DESISTENCIAVAGA: "Desistência de Vaga",
    EXERCICIOSDOMICILIARES: "Exercícios Domiciliares",
    ABONOFALTAS: "Abono de Faltas",
    ENTREGACERTIFICADOS: "Entrega de Certificados"
  };

  // Função para verificar se um período está ativo
  const checkPeriodActive = (dataInicioStr, dataFimStr) => {
    const today = new Date();
    const dataInicio = dataInicioStr ? parseISO(dataInicioStr) : null;
    const dataFim = dataFimStr ? parseISO(dataFimStr) : null;

    if (!dataInicio) {
        return false; // Período sem data de início não é considerado ativo
    }

    if (dataFim) {
        // Se tem data de fim, verifica se a data atual está dentro do intervalo
        return isWithinInterval(today, { start: dataInicio, end: dataFim });
    } else {
        // Se não tem data de fim (período aberto), verifica se a data atual é igual ou posterior à data de início
        return today >= dataInicio;
    }
  };

  // Função para carregar as disponibilidades
  const carregarDisponibilidades = async () => {
    try {
      const response = await axios.get("http://localhost:8000/solicitacoes/disponibilidades/");
      setDisponibilidades(response.data);
    } catch (err) {
      setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar disponibilidades."}`);
      setTipoMensagem("erro");
      setMostrarFeedback(true);
    }
  };

  useEffect(() => {
    carregarDisponibilidades();
  }, []); // Carrega ao montar o componente

  // Função para lidar com a exclusão (AGORA SEPARA AÇÃO POR TIPO DE ITEM)
  const confirmarExclusao = async () => {
    try {
      if (itemParaAcao.tipo === 'periodo') {
        // Exclui apenas o período específico
        await axios.delete(`http://localhost:8000/solicitacoes/periodos-disponibilidade/${itemParaAcao.periodoId}/`);
        setMensagemPopup("Período de disponibilidade excluído com sucesso.");
      } else {
        // Exclui a disponibilidade inteira (para "Sempre disponível" ou se não tiver períodos)
        await axios.delete(`http://localhost:8000/solicitacoes/disponibilidades/${itemParaAcao.disponibilidadeId}/`);
        setMensagemPopup("Disponibilidade excluída com sucesso.");
      }
      setTipoMensagem("sucesso");
      carregarDisponibilidades(); // Recarrega a lista após exclusão
    } catch (err) {
      setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir."}`);
      setTipoMensagem("erro");
    } finally {
      setMostrarPopup(false);
      setMostrarFeedback(true);
      setItemParaAcao(null); // Limpa o item selecionado
    }
  };

  const dadosParaTabela = useMemo(() => {
    const termo = filtro.toLowerCase();
    let dadosAplanados = [];

    disponibilidades.forEach((disponibilidade) => {
      const nomeFormulario = FORMULARIO_LABELS[disponibilidade.formulario]?.toLowerCase() || "";
      const formularioValue = disponibilidade.formulario?.toLowerCase() || "";

      // Aplica o filtro antes de expandir os períodos
      if (filtro && !(nomeFormulario.includes(termo) || formularioValue.includes(termo))) {
        return; // Pula esta disponibilidade se não corresponder ao filtro
      }

      if (disponibilidade.sempre_disponivel) {
        // Para "Sempre disponível", cria uma única linha
        dadosAplanados.push({
          // Um ID único para a linha da tabela
          id: `disp-${disponibilidade.id}-sempre`,
          tipo: 'disponibilidade', // Indica que esta linha representa uma disponibilidade completa
          disponibilidadeId: disponibilidade.id,
          periodoId: null, // Não há ID de período específico para 'sempre_disponivel'
          formulario: FORMULARIO_LABELS[disponibilidade.formulario] || disponibilidade.formulario,
          tipoDisponibilidade: "Sempre disponível",
          // Assume que `periodos[0].data_inicio` existe para "Sempre disponível" conforme seu `cadastrar_atualizar.js`
          periodoInfo: disponibilidade.periodos?.[0]?.data_inicio
                            ? `A partir de ${format(parseISO(disponibilidade.periodos[0].data_inicio), 'dd/MM/yyyy')}`
                            : 'Data inicial não definida',
          // Status da disponibilidade geral (vindo do backend)
          statusDisponibilidade: disponibilidade.ativo ? 'Ativo' : 'Inativo',
          // Status do período para "Sempre Disponível": ativo se a disponibilidade estiver ativa e a data inicial for válida
          statusPeriodo: (disponibilidade.ativo && disponibilidade.periodos?.[0]?.data_inicio && 
                          checkPeriodActive(disponibilidade.periodos[0].data_inicio, null)) ? 'Ativo' : 'Inativo'
        });
      } else if (disponibilidade.periodos && disponibilidade.periodos.length > 0) {
        // Para múltiplos períodos, cria uma linha para cada período
        disponibilidade.periodos.forEach((periodo) => {
          dadosAplanados.push({
            // Cria um ID único para a linha, combinando ID da disponibilidade e do período
            id: `disp-${disponibilidade.id}-periodo-${periodo.id}`,
            tipo: 'periodo', // Indica que esta linha representa um período específico
            disponibilidadeId: disponibilidade.id,
            periodoId: periodo.id, // ID do período específico para exclusão
            formulario: FORMULARIO_LABELS[disponibilidade.formulario] || disponibilidade.formulario,
            tipoDisponibilidade: "Por período(s)",
            periodoInfo: `${format(parseISO(periodo.data_inicio), 'dd/MM/yyyy')} a ${periodo.data_fim ? format(parseISO(periodo.data_fim), 'dd/MM/yyyy') : 'Indefinido'}`,
            // Status da disponibilidade geral (vindo do backend)
            statusDisponibilidade: disponibilidade.ativo ? 'Ativo' : 'Inativo',
            // Status do período é calculado individualmente E depende da disponibilidade estar ativa
            statusPeriodo: (disponibilidade.ativo && checkPeriodActive(periodo.data_inicio, periodo.data_fim)) ? 'Ativo' : 'Inativo'
          });
        });
      } else {
        // Caso onde não é sempre_disponivel e não há períodos, mas a disponibilidade existe
        dadosAplanados.push({
          id: `disp-${disponibilidade.id}-sem-periodos`,
          tipo: 'disponibilidade', // Ainda representa a disponibilidade aqui
          disponibilidadeId: disponibilidade.id,
          periodoId: null,
          formulario: FORMULARIO_LABELS[disponibilidade.formulario] || disponibilidade.formulario,
          tipoDisponibilidade: "Por período(s)",
          periodoInfo: "Nenhum período cadastrado",
          statusDisponibilidade: disponibilidade.ativo ? 'Ativo' : 'Inativo',
          statusPeriodo: 'Inativo' // Sem períodos, não pode estar ativo
        });
      }
    });

    return dadosAplanados;
  }, [disponibilidades, filtro]); // Dependências do useMemo

  const itensPorPagina = 5;
  const dadosPaginados = dadosParaTabela.slice(
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

        {dadosParaTabela.length === 0 ? (
          <p><br />Nenhuma disponibilidade encontrada!</p>
        ) : (
          <table className="tabela-cruds">
            <thead>
              <tr>
                <th>Formulário</th>
                <th>Tipo de Disponibilidade</th>
                <th>Períodos Cadastrados</th>
                <th>Status Período</th> {/* Status individual do período */}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosPaginados.map((item) => (
                <tr key={item.id}> {/* Usa o ID único gerado no useMemo */}
                  <td>{item.formulario}</td>
                  <td>{item.tipoDisponibilidade}</td>
                  <td>{item.periodoInfo}</td>
                  <td>
                    <span className={`status ${item.statusPeriodo === 'Ativo' ? 'ativo' : 'inativo'}`}>
                      {item.statusPeriodo}
                    </span>
                  </td>
                  <td>
                    <div className="botoes-acoes">
                      <BotaoEditar to={`/disponibilidades/${item.disponibilidadeId}`} />
                      <BotaoExcluir
                        onClick={() => {
                          // Passa o objeto completo do item para a ação, com tipo e IDs
                          setItemParaAcao(item);
                          setMostrarPopup(true);
                        }}
                      />
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
          mensagem="Tem certeza que deseja excluir?" // Mensagem genérica, pode ser mais específica
        />

        <PopupFeedback
          show={mostrarFeedback}
          mensagem={mensagemPopup}
          tipo={tipoMensagem}
          onClose={() => setMostrarFeedback(false)}
        />

        <BotaoVoltar onClick={() => navigate("/configuracoes")} />

        {dadosParaTabela.length > 0 && (
          <Paginacao
            dados={dadosParaTabela}
            paginaAtual={paginaAtual}
            setPaginaAtual={setPaginaAtual}
            itensPorPagina={itensPorPagina}
            onDadosPaginados={() => {}} // Mantém a prop que sua Paginacao espera
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
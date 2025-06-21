import axios from "axios";
import { format, parseISO } from 'date-fns'; // Para formatar datas corretamente
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import PeriodoForm from "../../pages/disponibilidade/PeriodoForm"; // Importe o novo componente

//CSS
import "../../components/styles/formulario.css";

export default function CadastrarAtualizarDisponibilidade() {
  const [formulario, setFormulario] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [sempreDisponivel, setSempreDisponivel] = useState(false); // Default para gerenciar períodos
  const [periods, setPeriods] = useState([]); // Armazena a lista de períodos {id, data_inicio, data_fim}
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [currentPeriodToEdit, setCurrentPeriodToEdit] = useState(null); // Para editar um período existente

  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // ID da Disponibilidade

  const FORMULARIO_CHOICES = [
    { value: "TRANCAMENTODISCIPLINA", label: "Trancamento de Disciplina" },
    { value: "TRANCAMENTOMATRICULA", label: "Trancamento de Matrícula" },
    { value: "DISPENSAEDFISICA", label: "Dispensa de Educação Física" },
    { value: "DESISTENCIAVAGA", label: "Desistência de Vaga" },
    { value: "EXERCICIOSDOMICILIARES", label: "Exercícios Domiciliares" },
    { value: "ABONOFALTAS", label: "Abono de Faltas" },
    { value: "ENTREGACERTIFICADOS", label: "Entrega de Certificados" }
  ];

  // Carrega dados para edição
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/disponibilidades/${id}/`)
        .then((res) => {
          setFormulario(res.data.formulario);
          setAtivo(res.data.ativo);

          if (res.data.periodos && res.data.periodos.length > 0) {
            // Verifica se é um único período 'sempre disponível'
            const isAlwaysAvailable = res.data.periodos.length === 1 && res.data.periodos[0].data_fim === null;
            setSempreDisponivel(isAlwaysAvailable);

            if (isAlwaysAvailable) {
              setPeriods([]); // Se for sempre disponível, não mostra períodos específicos
              // No caso de "sempre disponível", o data_inicio será o primeiro período
              // do array (que terá apenas um elemento)
              // Você pode usar um estado separado para data_inicio para o 'sempreDisponivel'
              // se quiser que o usuário possa alterar a data de início de um formulário sempre disponível.
              // Por enquanto, vamos assumir que o "sempreDisponivel" só precisa de data_inicio
              // ao CRIAR, e após isso o `data_fim` nulo é a indicação.
            } else {
              // Mapeia os períodos para o formato de input (YYYY-MM-DD)
              setPeriods(res.data.periodos.map(p => ({
                id: p.id,
                data_inicio: p.data_inicio ? format(parseISO(p.data_inicio), 'yyyy-MM-dd') : '',
                data_fim: p.data_fim ? format(parseISO(p.data_fim), 'yyyy-MM-dd') : '',
              })));
            }
          } else {
            // Se não tem períodos, assume como "sempre disponível" para uma nova configuração
            setSempreDisponivel(true);
            setPeriods([]);
          }
        })
        .catch((err) => {
          setMensagem(`Erro ao carregar: ${err.response?.data?.detail || "Dados não encontrados"}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    } else {
      // Para o modo de cadastro, default para 'sempre disponivel'
      setSempreDisponivel(true);
    }
  }, [id]);

  // Funções para gerenciar períodos
  const handleAddPeriod = (newPeriod) => {
    setPeriods([...periods, newPeriod]);
    setShowPeriodModal(false);
  };

  const handleUpdatePeriod = (updatedPeriod) => {
    setPeriods(periods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
    setShowPeriodModal(false);
    setCurrentPeriodToEdit(null);
  };

  const handleDeletePeriod = (periodToDelete) => {
    // Confirmação antes de deletar
    if (window.confirm(`Tem certeza que deseja remover o período de ${periodToDelete.data_inicio} a ${periodToDelete.data_fim || 'sem fim'}?`)) {
      setPeriods(periods.filter(p => p !== periodToDelete));
    }
  };

  const handleEditPeriod = (period) => {
    setCurrentPeriodToEdit(period);
    setShowPeriodModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Cria/Atualiza a Disponibilidade (sem períodos aninhados)
      const resDisponibilidade = await axios[id ? 'put' : 'post'](
        `http://localhost:8000/solicitacoes/disponibilidades/${id ? id + '/' : ''}`, // Adiciona a barra apenas se tiver ID
        { formulario, ativo }
      );
      const disponibilidadeId = resDisponibilidade.data.id;

      // 2. Apaga TODOS os períodos existentes para esta Disponibilidade (se for uma atualização)
      //    Esta é a estratégia de "deletar tudo e recriar" para simplificar a lógica de sync.
      if (id) {
        const existingPeriodsRes = await axios.get(`http://localhost:8000/solicitacoes/periodos-disponibilidade/?formulario_id=${id}`);
        const existingPeriodIds = existingPeriodsRes.data.map(p => p.id);

        for (const periodId of existingPeriodIds) {
          await axios.delete(`http://localhost:8000/solicitacoes/periodos-disponibilidade/${periodId}/`);
        }
      }

      // 3. Recria os períodos baseados no estado atual do frontend
      if (sempreDisponivel) {
        // Se "sempre disponível", cria um único período com data_fim nula
        // Permite que o usuário insira uma data de início mesmo em "sempre disponível"
        const singlePeriodData = {
          disponibilidade: disponibilidadeId,
          data_inicio: format(new Date(), 'yyyy-MM-dd'), // Ou pergunte ao usuário a data de início para "sempre disponivel"
          data_fim: null
        };
        await axios.post('http://localhost:8000/solicitacoes/periodos-disponibilidade/', singlePeriodData);
      } else {
        // Se não for "sempre disponível", cria os múltiplos períodos cadastrados
        if (periods.length === 0) {
            throw new Error("Pelo menos um período é necessário se não estiver 'Sempre Disponível'.");
        }
        for (const p of periods) {
            // Validar datas antes de enviar para garantir a integridade
            if (!p.data_inicio) {
                throw new Error("Data de início é obrigatória para todos os períodos.");
            }
            if (p.data_fim && new Date(p.data_fim) < new Date(p.data_inicio)) {
                throw new Error("Data de término não pode ser anterior à data de início.");
            }
            const periodData = {
                disponibilidade: disponibilidadeId,
                data_inicio: p.data_inicio,
                data_fim: p.data_fim || null // Garante null se a data de fim for vazia
            };
            await axios.post('http://localhost:8000/solicitacoes/periodos-disponibilidade/', periodData);
        }
      }

      setMensagem(id ? "Disponibilidade atualizada com sucesso!" : "Disponibilidade cadastrada com sucesso!");
      setTipoMensagem("sucesso");
      setCadastroSucesso(true);
    } catch (err) {
      console.error("Erro na operação:", err);
      // Erro de validação do backend (sobreposição, etc.)
      const errorMsg = err.response?.data?.data_inicio?.[0] || // DRF Validation errors
                       err.response?.data?.data_fim?.[0] ||
                       err.response?.data?.detail ||
                       err.message || // Erros lançados localmente (ex: período vazio)
                       "Falha na operação.";
      setMensagem(`Erro: ${errorMsg}`);
      setTipoMensagem("erro");
    } finally {
      setShowFeedback(true);
    }
  };

  return (
    <div>
      <main className="container form-container">
        <h2>{id ? "Editar Disponibilidade" : "Cadastrar Disponibilidade"}</h2>

        <form className="formulario formulario-largura" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Formulário:</label>
            <select
              className="input-text"
              value={formulario}
              onChange={(e) => setFormulario(e.target.value)}
              required
              disabled={!!id} // Impede edição do tipo após criação
            >
              <option value="">Selecione...</option>
              {FORMULARIO_CHOICES.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              Registro ativo?
            </label>
          </div>

          {/* Seção para "Sempre disponível" */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={sempreDisponivel}
                onChange={(e) => {
                  setSempreDisponivel(e.target.checked);
                  setPeriods([]); // Limpa períodos se mudar para sempre disponível
                }}
              />
              Sempre disponível (a partir da data atual)
            </label>
          </div>

          {/* Seção para múltiplos períodos, apenas se não for "sempre disponível" */}
          {!sempreDisponivel && (
            <div className="periodos-section">
              <h3>Períodos de Disponibilidade:</h3>
              {periods.length === 0 ? (
                <p>Nenhum período cadastrado. Adicione um abaixo.</p>
              ) : (
                <ul className="period-list">
                  {periods.map((p, index) => (
                    <li key={p.id || index} className="period-item">
                      <span>
                        {p.data_inicio ? format(parseISO(p.data_inicio), 'dd/MM/yyyy') : ''}
                        {' '}
                        a
                        {' '}
                        {p.data_fim ? format(parseISO(p.data_fim), 'dd/MM/yyyy') : 'Sem fim'}
                      </span>
                      <div className="period-actions">
                        <button type="button" onClick={() => handleEditPeriod(p)} style={{
                            padding: '6px 12px',
                            fontSize: '0.8em',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: '#007bff', /* Azul */
                            color: 'white',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} /* Hover Azul */
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                          Editar
                        </button>
                        <button type="button" onClick={() => handleDeletePeriod(p)} style={{
                            padding: '6px 12px',
                            fontSize: '0.8em',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: '#dc3545', /* Vermelho */
                            color: 'white',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'} /* Hover Vermelho */
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={() => { setCurrentPeriodToEdit(null); setShowPeriodModal(true); }} style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.95em',
                  backgroundColor: '#28a745', /* Verde */
                  color: 'white',
                  transition: 'background-color 0.2s ease',
                  marginTop: '15px',
                  display: 'block',
                  marginLeft: '0',
                  marginRight: 'auto',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'} /* Hover Verde */
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                Adicionar Período
              </button>
            </div>
          )}

          <button type="submit" className="submit-button">
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        {showPeriodModal && (
          <PeriodoForm
            periodo={currentPeriodToEdit}
            onSave={currentPeriodToEdit ? handleUpdatePeriod : handleAddPeriod}
            onCancel={() => setShowPeriodModal(false)}
            existingPeriodsForCurrentForm={periods}
          />
        )}

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            if (cadastroSucesso) {
              navigate("/disponibilidades");
            }
          }}
        />
      </main>
    </div>
  );
}
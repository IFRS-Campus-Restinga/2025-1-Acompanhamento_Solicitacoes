import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Certifique-se que esta linha está presente
import './PeriodoFormModal.css'; // Seu CSS para o modal

import { eachDayOfInterval, endOfDay, format, isValid, parseISO, startOfDay } from 'date-fns';

// A única nova prop esperada é 'existingPeriodsForCurrentForm'
export default function PeriodoForm({ periodo, onSave, onCancel, existingPeriodsForCurrentForm = [] }) {
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (periodo) {
      setDataInicio(periodo.data_inicio ? parseISO(periodo.data_inicio) : null);
      setDataFim(periodo.data_fim ? parseISO(periodo.data_fim) : null);
    } else {
      setDataInicio(null);
      setDataFim(null);
    }
    setErrors({});
  }, [periodo]);

  const validate = () => {
    const newErrors = {};
    if (!dataInicio) {
      newErrors.dataInicio = 'Data de início é obrigatória.';
    }
    if (dataFim && dataInicio && dataFim < dataInicio) {
      newErrors.dataFim = 'Data de término não pode ser anterior à data de início.';
    }
    // IMPORTANTE: Nenhuma validação de sobreposição aqui no frontend. Apenas visual.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        id: periodo ? periodo.id : null,
        data_inicio: dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null,
        data_fim: dataFim ? format(dataFim, 'yyyy-MM-dd') : null,
      });
    }
  };

  // Esta função agora usa APENAS os períodos da disponibilidade atual
  const getExcludedDates = () => {
    let excluded = [];

    // Filtra os períodos existentes para EXCLUIR o período que está sendo editado no momento.
    // Isso garante que você possa ajustar as datas do seu próprio período sem que ele se auto-desabilite.
    const periodsToExcludeFromCalendar = existingPeriodsForCurrentForm.filter(p => {
      // Se estamos editando um período (periodo existe) e o ID do período atual
      // é o mesmo do período que estamos iterando, exclua-o da lista de exclusão.
      if (periodo && p.id === periodo.id) {
        return false;
      }
      return true; // Inclua todos os outros períodos para exclusão
    });

    periodsToExcludeFromCalendar.forEach(p => {
      const start = p.data_inicio ? parseISO(p.data_inicio) : null;
      const end = p.data_fim ? parseISO(p.data_fim) : null;

      if (start && isValid(start)) {
        if (end && isValid(end)) {
          excluded = excluded.concat(eachDayOfInterval({ start: startOfDay(start), end: endOfDay(end) }));
        } else {
          // Se o período não tem data de fim (é "sempre disponível" para o sistema),
          // desabilita uma extensão razoável a partir da data de início.
          // Ajuste esta lógica se "sempre disponível" tiver outro significado aqui.
          const futureLimit = new Date(start);
          futureLimit.setFullYear(futureLimit.getFullYear() + 1); // Exemplo: 1 ano a partir da data de início
          excluded = excluded.concat(eachDayOfInterval({ start: startOfDay(start), end: endOfDay(futureLimit) }));
        }
      }
    });

    return excluded;
  };

  const excludedDates = getExcludedDates();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{periodo ? 'Editar Período' : 'Adicionar Novo Período'}</h3>
        <form className="formulario formulario-largura" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Data Início:</label>
            <DatePicker
              selected={dataInicio}
              onChange={(date) => setDataInicio(date)}
              selectsStart
              startDate={dataInicio}
              endDate={dataFim}
              dateFormat="dd/MM/yyyy"
              className="input-text"
              placeholderText="Selecione a data de início"
              required
              excludeDates={excludedDates} // Aplica as datas a serem desabilitadas
              minDate={!periodo ? new Date() : undefined} // Desabilita datas passadas para novos períodos
            />
            {errors.dataInicio && <span className="error-message">{errors.dataInicio}</span>}
          </div>
          <div className="form-group">
            <label>Data Fim (opcional):</label>
            <DatePicker
              selected={dataFim}
              onChange={(date) => setDataFim(date)}
              selectsEnd
              startDate={dataInicio}
              endDate={dataFim}
              minDate={dataInicio}
              dateFormat="dd/MM/yyyy"
              className="input-text"
              placeholderText="Selecione a data de fim"
              excludeDates={excludedDates}
            />
            {errors.dataFim && <span className="error-message">{errors.dataFim}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="button submit-button">
              {periodo ? 'Atualizar Período' : 'Adicionar Período'}
            </button>
            <button type="button" onClick={onCancel} style={{
              padding: '6px 12px',
              fontSize: '0.8em',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              backgroundColor: '#dc3545',
              color: 'white',
              transition: 'background-color 0.2s ease',
            }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
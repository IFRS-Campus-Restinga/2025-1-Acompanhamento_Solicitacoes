import React, { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Importe para formatação de datas

export default function PeriodoForm({ periodo, onSave, onCancel }) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (periodo) {
      setDataInicio(periodo.data_inicio || '');
      setDataFim(periodo.data_fim || '');
    } else {
      // Limpa os campos se for para adicionar um novo
      setDataInicio('');
      setDataFim('');
    }
    setErrors({}); // Limpa erros ao abrir/editar
  }, [periodo]);

  const validate = () => {
    const newErrors = {};
    if (!dataInicio) {
      newErrors.dataInicio = 'Data de início é obrigatória.';
    }
    if (dataFim && dataInicio && new Date(dataFim) < new Date(dataInicio)) {
      newErrors.dataFim = 'Data de término não pode ser anterior à data de início.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        id: periodo ? periodo.id : null, // Mantém o ID se estiver editando
        data_inicio: dataInicio,
        data_fim: dataFim || null, // Garante que data_fim seja null se vazio
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content form-box">
        <h3>{periodo ? 'Editar Período' : 'Adicionar Novo Período'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Data Início:</label>
            <input
              type="date"
              className="input-text"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
            {errors.dataInicio && <span className="error-message">{errors.dataInicio}</span>}
          </div>
          <div className="form-group">
            <label>Data Fim (opcional):</label>
            <input
              type="date"
              className="input-text"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              min={dataInicio || undefined} // Define o min para evitar data fim < data inicio
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
                            backgroundColor: '#dc3545', /* Vermelho */
                            color: 'white',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'} /* Hover Vermelho */
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
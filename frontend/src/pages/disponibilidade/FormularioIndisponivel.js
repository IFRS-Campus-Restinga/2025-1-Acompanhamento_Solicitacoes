import { useLocation, useNavigate } from 'react-router-dom';
import HeaderAluno from "../../components/base/headers/header_aluno";
import Footer from "../../components/base/footer";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import './FormularioIndisponivel.css';

export default function FormularioIndisponivel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tipoFormulario, periodo, error } = location.state || {};

  // Corrigido o nome da variável (de mensagens para nomesFormularios)
  const nomesFormularios = {
    'TRANCAMENTODISCIPLINA': 'Trancamento de Disciplina',
    'TRANCAMENTOMATRICULA': 'Trancamento de Matrícula',
    'DISPENSAEDFISICA': 'Dispensa de Educação Física',
    'DESISTENCIAVAGA': 'Desistência de Vaga',
    'EXERCICIOSDOMICILIARES': 'Exercícios Domiciliares',
    'ABONOFALTAS': 'Abono de Faltas',
    'ENTREGACERTIFICADOS': 'Entrega de Certificados'
  };

  return (
    <div className="page-container">
      <HeaderAluno />
      
      <main className="content-wrapper indisponivel-container">
        <div className="card-indisponivel">
          <div className="icon-container">
            <i className="fas fa-calendar-times"></i>
          </div>
          
          <h2>Formulário Indisponível</h2>
          
          <div className="message-container">
            {error ? (
              <p className="error-message">Ocorreu um erro ao verificar a disponibilidade deste formulário.</p>
            ) : (
              <>
                <p>O formulário de <strong>{nomesFormularios[tipoFormulario] || 'solicitação'}</strong> não está disponível no momento.</p>
                {periodo && (
                  <p className="periodo-info">
                    <i className="fas fa-info-circle"></i> Período válido: {periodo}
                  </p>
                )}
              </>
            )}
          </div>

          <button 
            className="btn-voltar btn-verde"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i> Voltar
          </button>
        </div>
      </main>

      <Footer />
      <PopupFeedback />
    </div>
  );
}
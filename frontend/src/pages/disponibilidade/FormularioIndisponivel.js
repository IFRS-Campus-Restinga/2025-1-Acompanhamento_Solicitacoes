import { useLocation, useNavigate } from 'react-router-dom';
import HeaderAluno from "../../components/base/headers/header_aluno";
import Footer from "../../components/base/footer";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import './FormularioIndisponivel.css';
// Remova as importações de date-fns, elas não serão mais necessárias
// import { format, parseISO, isValid } from 'date-fns'; 

export default function FormularioIndisponivel() {
  const location = useLocation();
  const navigate = useNavigate();
  // Não precisamos mais de 'periodo' ou 'periodos' se não vamos exibi-los
  const { tipoFormulario, error } = location.state || {}; 

  const nomesFormularios = {
    'TRANCAMENTODISCIPLINA': 'Trancamento de Disciplina',
    'TRANCAMENTOMATRICULA': 'Trancamento de Matrícula',
    'DISPENSAEDFISICA': 'Dispensa de Educação Física',
    'DESISTENCIAVAGA': 'Desistência de Vaga',
    'EXERCICIOSDOMICILIARES': 'Exercícios Domiciliares',
    'ABONOFALTAS': 'Abono de Faltas',
    'ENTREGACERTIFICADOS': 'Entrega de Certificados'
  };

  // Remova a função formatPeriod inteira

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
                {/* Remova TODA esta seção que exibia o período, seja único ou múltiplos */}
                {/*
                {periodo && !periodos && ( 
                  <p className="periodo-info">
                    <i className="fas fa-info-circle"></i> Período válido: <strong>{formatPeriod(periodo)}</strong>
                  </p>
                )}
                {periodos && periodos.length > 0 && (
                  <div className="periodos-detalhes">
                    <p className="periodo-info"><i className="fas fa-info-circle"></i> Os períodos válidos para este formulário são:</p>
                    <ul>
                      {periodos.map((p, index) => (
                        <li key={index}>{formatPeriod(p)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!periodo && (!periodos || periodos.length === 0) && (
                  <p className="periodo-info">
                    <i className="fas fa-info-circle"></i> Não há período válido especificado para este formulário no momento.
                  </p>
                )}
                */}
                {/* Opcional: Se quiser uma mensagem genérica caso não haja período específico */}
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
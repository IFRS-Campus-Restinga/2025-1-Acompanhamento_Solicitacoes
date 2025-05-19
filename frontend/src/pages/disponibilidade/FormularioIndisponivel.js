import { useLocation } from 'react-router-dom';

export default function FormularioIndisponivel() {
  const location = useLocation();
  const tipoFormulario = location.state?.tipoFormulario || '';

  const mensagens = {
    'TRANCAMENTODISCIPLINA': 'Trancamento de Disciplina',
    'TRANCAMENTOMATRICULA': 'Trancamento de Matrícula',
    'DISPENSAEDFISICA': 'Dispensa de Educação Física',
    'DESISTENCIAVAGA': 'Desistência de Vaga',
    'EXERCICIOSDOMICILIARES': 'Exercícios Domiciliares',
    'ABONOFALTAS': 'Abono de Faltas',
    'ENTREGACERTIFICADOS': 'Entrega de Certificados'
  };

  return (
    <div className="container">
      <h2>Formulário Indisponível</h2>
      <p>
        {location.state?.error
          ? 'Erro ao verificar disponibilidade.'
          : `O formulário de ${mensagens[tipoFormulario] || 'solicitação'} não está disponível no momento.`
        }
      </p>
      <button onClick={() => window.history.back()}>Voltar</button>
    </div>
  );
}
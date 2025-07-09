import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../../components/styles/telas_opcoes.css";
import { getAvailableForms, getUserRole, shouldDisableForm } from "../../../utils/permissions";
import { PermissionDebugInfo } from "../../../components/PermissionWrapper";

const AlunoNovaSolicitacao = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [availableForms, setAvailableForms] = useState([]);
  const userRole = getUserRole();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/solicitacoes/")
      .then((res) => setSolicitacoes(res.data))
      .catch((err) => console.error("Erro ao buscar solicitações:", err));
    
    // Carrega os formulários disponíveis para o usuário atual
    setAvailableForms(getAvailableForms());
  }, []);

  // Definição de todos os formulários com suas informações
  const allForms = [
    {
      id: 'trancamento_matricula',
      name: 'Trancamento de Matrícula',
      path: '/trancamento_matricula',
      icon: 'bi bi-box-arrow-right form-icon',
      allowedRoles: ['aluno', 'responsavel']
    },
    {
      id: 'trancamento_disciplina',
      name: 'Trancamento de Componente Curricular',
      path: '/trancamento_disciplina',
      icon: 'bi bi-x-octagon-fill form-icon',
      allowedRoles: ['aluno', 'responsavel']
    },
    {
      id: 'desistencia_vaga',
      name: 'Termo de Desistência de Vaga',
      path: '/desistencia_vaga',
      icon: 'bi bi-door-open-fill form-icon',
      allowedRoles: ['aluno', 'externo', 'responsavel']
    },
    {
      id: 'entrega_ativ_compl',
      name: 'Entrega de Atividades Complementares',
      path: '/form_ativ_compl',
      icon: 'bi bi-card-list form-icon',
      allowedRoles: ['aluno', 'responsavel']
    },
    {
      id: 'dispensa_ed_fisica',
      name: 'Dispensa de Educação Física',
      path: '/dispensa_ed_fisica',
      icon: 'bi bi-person-arms-up form-icon',
      allowedRoles: ['aluno', 'responsavel'] 
    },
    {
      id: 'abono_falta',
      name: 'Justificativa / Abono de Faltas',
      path: '/abono_falta',
      icon: 'bi bi-calendar-x-fill form-icon',
      allowedRoles: ['aluno', 'responsavel']
    },
    {
      id: 'exercicio_domiciliar',
      name: 'Exercícios Domiciliares',
      path: '/exercicio_domiciliar',
      icon: 'bi bi-house-check-fill form-icon',
      allowedRoles: ['aluno', 'responsavel']
    }
  ];

  // Função para renderizar um card de formulário
  const renderFormCard = (form) => {
    const isDisabled = shouldDisableForm(form.id);
    
    // Se o formulário deve ser desabilitado, renderiza o card desabilitado
    if (isDisabled) {
      return (
        <div 
          key={form.id}
          className={`colunas-link disabled-form ${hoveredCard === form.id ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredCard(form.id)}
          onMouseLeave={() => setHoveredCard(null)}
          title={`Este formulário não está disponível para usuários do tipo: ${userRole}`}
          style={{
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #dee2e6'
          }}
        >
          <i className={form.icon} style={{ opacity: 0.5 }}></i>
          <span style={{ textDecoration: 'line-through' }}>
            {form.name}
          </span>
          <small className="text-muted d-block mt-1">
            Não disponível para {userRole}
          </small>
        </div>
      );
    }

    // Se o usuário tem permissão, renderiza o card normal
    return (
      <Link 
        key={form.id}
        className="colunas-link" 
        to={form.path}
        onMouseEnter={() => setHoveredCard(form.id)}
        onMouseLeave={() => setHoveredCard(null)}
        data-hovered={hoveredCard === form.id}
      >
        <i className={form.icon}></i>
        {form.name}
      </Link>
    );
  };

  // Separa os formulários em duas fileiras
  const firstRowForms = allForms.slice(0, 4);
  const secondRowForms = allForms.slice(4, 7);

  return (
    <div className="colunas-container">
      <main className="container">
        <h2 className="tela-opcoes-titulo">Formulários</h2>
        
        {/* Informação sobre o usuário atual */}
        <div className="alert alert-info mb-4" role="alert">
          <i className="bi bi-person-circle me-2"></i>
          <strong>Usuário:</strong> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          <br />
          <small>
            Você tem acesso a {availableForms.length} de {allForms.length} formulários disponíveis.
          </small>
        </div>

        <div className="colunas-section-container">
          {/* PRIMEIRA FILEIRA: 4 Formulários */}
          <section className="colunas-section">
            <div className="grid-colunas">
              {firstRowForms.map(renderFormCard)}
            </div>
          </section>  
          
          {/* SEGUNDA FILEIRA: 3 Formulários */}
          <section className="colunas-section">
            <div className="grid-colunas">
              {secondRowForms.map(renderFormCard)}
            </div>
          </section>
        </div>

        {/* Informações de debug (apenas em desenvolvimento) */}
        <PermissionDebugInfo />
      </main>
    </div>
  );
};

export default AlunoNovaSolicitacao;



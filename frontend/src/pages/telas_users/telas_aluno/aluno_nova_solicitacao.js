import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../../components/styles/telas_opcoes.css";
import { PermissionDebugInfo } from "../../../components/PermissionWrapper";
import { verificarGrupo, getCookie } from '../../../services/authUtils'; 


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


// Funções que você precisa definir ou importar de outro lugar
// Se getAvailableForms e shouldDisableForm dependem da userRole, elas precisarão ser adaptadas.
// Por enquanto, vamos assumir que elas serão definidas aqui ou em um novo arquivo de utilitários.

// --- NOVAS FUNÇÕES OU ADAPTAÇÕES ---
// Adapte estas funções para usar a 'userRole' que será obtida de forma assíncrona.

// Função para obter a role do usuário do cookie 'userRole'
const getUserRoleFromCookie = () => {
  return getCookie('userRole'); // getCookie vem de authUtils
};

// Adapte getAvailableForms para receber a role como argumento
const getAvailableFormsByRole = (role) => {
  // Sua lógica original de getAvailableForms aqui, mas usando 'role'
  // Exemplo:
  const allForms = [ /* ... sua lista allForms ... */ ]; // Copie a lista allForms para cá ou passe-a
  return allForms.filter(form => form.allowedRoles.includes(role));
};

// Adapte shouldDisableForm para receber a role como argumento
const shouldDisableFormByRole = (formId, role) => {
  // Sua lógica original de shouldDisableForm aqui, mas usando 'role'
  // Exemplo:
  const form = allForms.find(f => f.id === formId); // allForms precisa estar acessível
  if (!form) return true; // Formulário não encontrado
  return !form.allowedRoles.includes(role);
};
// --- FIM DAS NOVAS FUNÇÕES OU ADAPTAÇÕES ---


const AlunoNovaSolicitacao = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [availableForms, setAvailableForms] = useState([]);
  const [userRole, setUserRole] = useState(null); // <-- userRole agora é um estado

  // Definição de todos os formulários com suas informações
  // Mova esta lista para fora do componente ou passe-a como prop,
  // ou defina-a dentro do useEffect se ela for estática e não mudar.
  // Para simplificar, vou deixá-la aqui por enquanto, mas o ideal é que seja uma constante fora.
  

  useEffect(() => {
    // Função assíncrona para carregar a role e os formulários
    const loadData = async () => {
      // 1. Obter a role do usuário
      const roleFromCookie = getUserRoleFromCookie(); // Tenta ler do cookie primeiro
      if (roleFromCookie) {
        setUserRole(roleFromCookie);
      } else {
        // Se não estiver no cookie, tenta verificar com o backend (assíncrono)
        const roleFromBackend = await verificarGrupo();
        setUserRole(roleFromBackend);
      }

      // 2. Carregar solicitações
      axios
        .get("http://127.0.0.1:8000/solicitacoes/" )
        .then((res) => setSolicitacoes(res.data))
        .catch((err) => console.error("Erro ao buscar solicitações:", err));
    };

    loadData();
  }, []); // <-- Array de dependências vazio para rodar apenas na montagem

  // Use um segundo useEffect para atualizar availableForms quando userRole mudar
  useEffect(() => {
    if (userRole) {
      // Filtra os formulários com base na role do usuário
      const formsFiltered = allForms.filter(form => form.allowedRoles.includes(userRole));
      setAvailableForms(formsFiltered);
    }
  }, [userRole]); // <-- Depende de userRole

  // Função para renderizar um card de formulário
  const renderFormCard = (form) => {
    // Agora shouldDisableFormByRole precisa da userRole
    const isDisabled = shouldDisableFormByRole(form.id, userRole); // <-- Passe userRole

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
  // Use availableForms aqui, não allForms, se você quer que apenas os disponíveis sejam renderizados
  const firstRowForms = availableForms.slice(0, 4);
  const secondRowForms = availableForms.slice(4, 7);

  // Adicione um estado de carregamento para a role, se necessário
  if (!userRole) {
    return <p>Carregando permissões...</p>; // Ou um spinner
  }

  return (
    <div className="colunas-container">
      <main className="container">
        <h2 className="tela-opcoes-titulo ">Solicitações</h2>
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

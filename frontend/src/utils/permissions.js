// utils/permissions.js
// Utilitário para gerenciar permissões no frontend baseado nos grupos Django

/**
 * Helper para ler um cookie específico
 * @param {string} name - Nome do cookie
 * @returns {string|null} - Valor do cookie ou null se não encontrado
 */
const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Obtém a role do usuário atual
 * @returns {string} - A role do usuário (
 *                     'aluno', 'externo', 'responsavel', 'coordenador', 'cre', 'public'
 *                   ) ou 'public' se não for identificada.
 */
export const getUserRole = () => {
    console.log("[getUserRole] Iniciando determinação da role...");

    // 1. Primeiro tenta ler da URL (para testes e debug)
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get("role");
    if (urlRole) {
        const cleanUrlRole = String(urlRole).toLowerCase().trim();
        localStorage.setItem("tempUserRole", cleanUrlRole);
        console.log(`[getUserRole] Role da URL detectada: ${cleanUrlRole}`);
        return cleanUrlRole;
    }

    // 2. Tenta ler do localStorage temporário (para persistência em testes)
    const storedTempRole = localStorage.getItem("tempUserRole");
    if (storedTempRole) {
        const cleanStoredTempRole = String(storedTempRole).toLowerCase().trim();
        console.log(`[getUserRole] Role do localStorage temporário: ${cleanStoredTempRole}`);
        return cleanStoredTempRole;
    }

    // 3. Tenta ler dos dados do usuário logado (Google Auth) no localStorage
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
        console.log(`[getUserRole] Dados de usuário no localStorage: ${usuarioData}`);
        try {
            const usuario = JSON.parse(usuarioData);
            if (typeof usuario === 'object' && usuario !== null && usuario.role) {
                const cleanUserRole = String(usuario.role).toLowerCase().trim();
                console.log(`[getUserRole] Role do usuário logado (Google Auth) encontrada: ${cleanUserRole}`);
                return cleanUserRole;
            } else {
                console.warn("[getUserRole] Objeto 'usuario' no localStorage não contém a propriedade 'role' ou não é um objeto válido.", usuario);
            }
        } catch (error) {
            console.error("[getUserRole] Erro ao fazer parse dos dados do usuário no localStorage:", error);
        }
    } else {
        console.log("[getUserRole] Nenhum dado de usuário encontrado no localStorage.");
    }

    // 4. Tenta ler do cookie 'userRole' (como o HeaderSwitcher faz)
    const cookieRole = getCookie('userRole');
    if (cookieRole) {
        const cleanCookieRole = String(cookieRole).toLowerCase().trim();
        console.log(`[getUserRole] Role do cookie 'userRole' detectada: ${cleanCookieRole}`);
        return cleanCookieRole;
    }

    console.log("[getUserRole] Nenhuma role específica encontrada, usando padrão: public");
    return "public"; // Padrão para usuários não logados ou não identificados
};

/**
 * Verifica se o usuário tem permissão para acessar um formulário específico
 * @param {string} formType - Tipo do formulário (
 *                            'desistencia_vaga', 'abono_falta', etc.
 *                          )
 * @returns {boolean} - true se tem permissão, false caso contrário
 */
export const canAccessForm = (formType) => {
    const userRole = getUserRole();
    
    const formPermissions = {
        'desistencia_vaga': ['aluno', 'externo', 'responsavel'],
        'abono_falta': ['aluno', 'responsavel'],
        'dispensa_ed_fisica': ['aluno', 'responsavel'], 
        'entrega_ativ_compl': ['aluno', 'responsavel'],
        'trancamento_disciplina': ['aluno', 'responsavel'],
        'trancamento_matricula': ['aluno', 'responsavel'],
        'exercicio_domiciliar': ['aluno', 'responsavel']
    };
    
    const allowedRoles = formPermissions[formType] || [];
    return allowedRoles.includes(userRole);
};

/**
 * Verifica se o usuário pode visualizar suas próprias solicitações
 * @returns {boolean}
 */
export const canViewOwnSolicitations = () => {
    const userRole = getUserRole();
    return ['aluno', 'responsavel', 'externo'].includes(userRole);
};

/**
 * Verifica se o usuário pode responder/gerenciar solicitações
 * @returns {boolean}
 */
export const canManageSolicitations = () => {
    const userRole = getUserRole();
    return ['coordenador', 'cre'].includes(userRole);
};

/**
 * Verifica se o usuário pode gerenciar o sistema (CRUD de entidades)
 * @returns {boolean}
 */
export const canManageSystem = () => {
    const userRole = getUserRole();
    return userRole === 'cre';
};

/**
 * Verifica se o usuário pode gerenciar motivos
 * @returns {boolean}
 */
export const canManageMotivos = () => {
    const userRole = getUserRole();
    return ['cre', 'coordenador'].includes(userRole);
};

/**
 * Obtém a lista de formulários disponíveis para o usuário atual
 * @returns {Array} - Array de objetos com informações dos formulários disponíveis
 */
export const getAvailableForms = () => {
    const userRole = getUserRole();
    
    const allForms = [
        {
            id: 'desistencia_vaga',
            name: 'Desistência de Vaga',
            path: '/desistencia_vaga',
            description: 'Solicitar desistência de vaga no curso',
            allowedRoles: ['aluno', 'externo', 'responsavel']
        },
        {
            id: 'abono_falta',
            name: 'Abono de Falta',
            path: '/abono_falta',
            description: 'Solicitar abono de faltas',
            allowedRoles: ['aluno', 'responsavel']
        },
        {
            id: 'dispensa_ed_fisica',
            name: 'Dispensa de Educação Física',
            path: '/dispensa_ed_fisica',
            description: 'Solicitar dispensa de educação física',
            allowedRoles: ['aluno', 'responsavel'] 
        },
        {
            id: 'entrega_ativ_compl',
            name: 'Entrega de Atividades Complementares',
            path: '/form_ativ_compl',
            description: 'Entregar atividades complementares',
            allowedRoles: ['aluno', 'responsavel']
        },
        {
            id: 'trancamento_disciplina',
            name: 'Trancamento de Disciplina',
            path: '/trancamento_disciplina',
            description: 'Solicitar trancamento de disciplina',
            allowedRoles: ['aluno', 'responsavel']
        },
        {
            id: 'trancamento_matricula',
            name: 'Trancamento de Matrícula',
            path: '/trancamento_matricula',
            description: 'Solicitar trancamento de matrícula',
            allowedRoles: ['aluno', 'responsavel']
        },
        {
            id: 'exercicio_domiciliar',
            name: 'Exercício Domiciliar',
            path: '/exercicio_domiciliar',
            description: 'Solicitar exercícios domiciliares',
            allowedRoles: ['aluno', 'responsavel']
        }
    ];
    
    // Filtra apenas os formulários que o usuário pode acessar
    return allForms.filter(form => form.allowedRoles.includes(userRole));
};

/**
 * Verifica se um elemento deve ser desabilitado baseado nas permissões
 * @param {string} formType - Tipo do formulário
 * @returns {boolean} - true se deve ser desabilitado, false caso contrário
 */
export const shouldDisableForm = (formType) => {
    return !canAccessForm(formType);
};

/**
 * Obtém mensagem de erro para acesso negado
 * @param {string} formType - Tipo do formulário
 * @returns {string} - Mensagem de erro
 */
export const getAccessDeniedMessage = (formType) => {
    const userRole = getUserRole();
    
    if (userRole === 'public') {
        return 'Você precisa estar logado para acessar este formulário.';
    }
    
    const formPermissions = {
        'desistencia_vaga': 'Apenas alunos, responsáveis ou usuários externos podem acessar este formulário.',
        'abono_falta': 'Apenas alunos ou responsáveis podem acessar este formulário.',
        'dispensa_ed_fisica': 'Apenas alunos, responsáveis ou usuários externos podem acessar este formulário.',
        'entrega_ativ_compl': 'Apenas alunos ou responsáveis podem acessar este formulário.',
        'trancamento_disciplina': 'Apenas alunos ou responsáveis podem acessar este formulário.',
        'trancamento_matricula': 'Apenas alunos ou responsáveis podem acessar este formulário.',
        'exercicio_domiciliar': 'Apenas alunos ou responsáveis podem acessar este formulário.'
    };
    
    return formPermissions[formType] || 'Você não tem permissão para acessar este formulário.';
};

/**
 * Verifica se o usuário pode se cadastrar
 * @returns {boolean}
 */
export const canRegister = () => {
    // Todos os grupos podem se cadastrar
    return true;
};

/**
 * Obtém as rotas disponíveis baseadas na role do usuário
 * @returns {Array} - Array de rotas disponíveis
 */
export const getAvailableRoutes = () => {
    const userRole = getUserRole();
    
    const routesByRole = {
        'aluno': [
            '/aluno/nova-solicitacao',
            '/aluno/minhas-solicitacoes',
            '/perfil'
        ],
        'externo': [
            '/externo/desistencia-vaga',
            '/desistencia_vaga',
            '/perfil'
        ],
        'responsavel': [
            '/aluno/nova-solicitacao', // Pode fazer solicitações pelo aluno
            '/aluno/minhas-solicitacoes', // Pode acompanhar solicitações
            '/perfil'
        ],
        'coordenador': [
            '/coordenador/coordenador_home',
            '/perfil'
        ],
        'cre': [
            '/cre/home',
            '/cre/gestao-sistema',
            '/perfil',
            // Adicionar todas as rotas de gestão aqui para o CRE
            '/motivo_abono',
            '/motivo_abono/cadastrar',
            '/motivo_abono/:id',
            '/motivo_exercicios',
            '/motivo_exercicios/cadastrar',
            '/motivo_exercicios/:id',
            '/motivo_dispensa',
            '/motivo_dispensa/cadastrar',
            '/motivo_dispensa/:id',
            '/disciplinas',
            '/disciplinas/cadastrar',
            '/disciplinas/:codigo',
            '/turmas',
            '/turmas/cadastrar',
            '/turmas/:id',
            '/cursos',
            '/cursos/cadastrar',
            '/cursos/:codigo',
            '/ppcs',
            '/ppcs/cadastrar',
            '/ppcs/:codigo',
            '/usuarios',
            '/usuarios/inativos',
            '/usuarios/:id',
            '/usuarios/selecionargrupo',
            '/usuarios/selecionargrupogestaosistema',
            '/usuarios/cadastro',
            '/usuarios/editar/:id',
            '/usuarios/cadastro/:grupo',
            '/usuarios/editar/:grupo/:id',
            '/usuarios/editar/externo/:id',
            '/usuarios/editar/responsavel/:id',
            '/mandatos/cadastrar',
            '/mandatos/editar/:id',
            '/mandatos',
            '/grupos',
            '/grupos/cadastrar',
            '/grupos/:id',
            '/disponibilidades',
            '/disponibilidades/cadastrar',
            '/disponibilidades/:id',
            '/todas-solicitacoes',
            '/exercicios_domiciliares/gerenciar'
        ],
        'public': [
            '/'
        ]
    };
    
    return routesByRole[userRole] || routesByRole['public'];
};


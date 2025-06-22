// Importações necessárias para o componente
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Importado para ler parâmetros da URL

// Importa todos os componentes de cabeçalho específicos
import HeaderAluno from './header_aluno';
import HeaderCoordenador from './header_coordenador';
import HeaderCRE from './header_cre';
import HeaderExterno from './header_externo';
import HeaderPadrao from './header_padrao'; // Cabeçalho padrão para usuários não identificados

const HeaderSwitcher = () => {
    // Estado que armazena a 'role' (papel) do usuário detectada.
    // Inicialmente é 'null' enquanto a role está sendo determinada.
    const [userRole, setUserRole] = useState(null);

    // Hook 'useLocation' do React Router DOM para acessar a URL atual
    // e seus parâmetros de query (ex: '?role=aluno').
    const location = useLocation();

    // O 'useEffect' é executado após a montagem do componente e sempre que
    // suas dependências (neste caso, 'location.search') mudam.
    useEffect(() => {
        // 'detectedRole' é a variável que armazenará a role determinada.
        // O valor padrão é 'public', para usuários não logados ou não identificados.
        let detectedRole = 'public';

        // --- LÓGICA DE DETECÇÃO DA ROLE (COM PRIORIDADE DE LEITURA) ---

        // 1. Tenta ler a 'role' dos parâmetros da URL.
        //    Esta é a solução TEMPORÁRIA para testes e demonstrações de sprint.
        //    Exemplo de uso na URL: http://localhost:3000/?role=aluno
        const params = new URLSearchParams(location.search);
        const urlRole = params.get('role');

        if (urlRole) {
            // Se a 'role' foi encontrada na URL:
            detectedRole = urlRole; // A role detectada é a da URL.
            // Salva a role no 'localStorage' sob a chave 'tempUserRole'.
            // Isso é CRUCIAL para que a role persista durante a navegação interna
            // (quando o parâmetro '?role=' não estiver mais na URL).
            localStorage.setItem('tempUserRole', urlRole);
            console.warn(`[HeaderSwitcher] Role da URL detectada e salva em localStorage: "${urlRole}".`);
        } else {
            // 2. Se a 'role' NÃO está na URL, tenta lê-la da chave 'tempUserRole' no localStorage.
            //    Esta é a forma como a role se mantém entre as diferentes páginas após
            //    a primeira vez que foi definida pela URL.
            const storedTempRole = localStorage.getItem('tempUserRole');
            if (storedTempRole) {
                // Se a 'tempUserRole' foi encontrada no localStorage:
                detectedRole = storedTempRole; // A role detectada é a do localStorage temporário.
                console.log(`[HeaderSwitcher] Role recuperada do localStorage ('tempUserRole'): "${storedTempRole}".`);
            } else {
                // 3. Se a 'role' NÃO está na URL nem em 'tempUserRole' no localStorage,
                //    então tenta lê-la da chave 'usuario' do localStorage.
                //    Esta é a lógica ORIGINAL, destinada a funcionar quando a integração
                //    do login Google com persistência de role estiver COMPLETA e funcional.
                const usuarioData = localStorage.getItem('usuario');
                if (usuarioData) {
                    try {
                        const usuario = JSON.parse(usuarioData);
                        // Verifica se o objeto 'usuario' (do login Google) possui a propriedade 'role'.
                        if (usuario.role) {
                            detectedRole = usuario.role; // A role detectada é a do login Google.
                            console.log(`[HeaderSwitcher] Role do login Google detectada: "${usuario.role}".`);
                        }
                    } catch (error) {
                        // Captura e loga erros caso o JSON de 'usuarioData' seja inválido
                        // ou a propriedade 'role' não esteja presente.
                        console.error("[HeaderSwitcher] Erro ao fazer parse ou 'role' não encontrada em dados do usuário do Google:", error);
                        // Se houver um erro aqui, 'detectedRole' permanece como 'public'.
                    }
                }
                // Se nenhuma das fontes anteriores forneceu uma role específica,
                // a 'detectedRole' permanece 'public', que é seu valor inicial padrão.
                console.log(`[HeaderSwitcher] Nenhuma role específica encontrada, usando padrão: "${detectedRole}".`);
            }
        }

        // Finalmente, atualiza o estado 'userRole' com a role detectada.
        // Esta atualização acionará uma nova renderização do componente,
        // que por sua vez exibirá o cabeçalho apropriado.
        setUserRole(detectedRole);

    }, [location.search]); // O efeito é re-executado quando o parâmetro de busca da URL (location.search) muda.

    // Enquanto 'userRole' for 'null' (significa que a role ainda está sendo determinada),
    // o componente não renderiza nenhum cabeçalho para evitar piscar na tela.
    if (userRole === null) {
        return null; // Poderia ser um loader aqui, se preferir.
    }

    // --- SELEÇÃO DO COMPONENTE DE CABEÇALHO COM BASE NA ROLE ---
    // Este 'switch' direciona para o componente de cabeçalho correto
    // baseado na 'userRole' determinada.
    switch (userRole) {
        case 'responsavel':
            return <HeaderAluno />; // Responsáveis usam o mesmo cabeçalho que Alunos.
        case 'aluno':
            return <HeaderAluno />;
        case 'coordenador':
            return <HeaderCoordenador />;
        case 'cre':
            return <HeaderCRE />;
        case 'externo':
            return <HeaderExterno />;
        case 'public': // Role padrão para usuários não logados ou não identificados.
        default: // Caso a 'userRole' detectada não corresponda a nenhum dos 'case's acima.
            return <HeaderPadrao />; // Exibe o cabeçalho padrão.
    }
};

export default HeaderSwitcher;


// --- CÓDIGO ORIGINAL ANTES DAS ALTERAÇÕES (MANTIDO PARA REFERÊNCIA) ---
/*
// src/components/base/headers/HeaderSwitcher.js
// import { useEffect, useState } from 'react';
// import HeaderAluno from './header_aluno';
// import HeaderCoordenador from './header_coordenador';
// import HeaderCRE from './header_cre';
// import HeaderExterno from './header_externo';
// import HeaderPadrao from './header_padrao';

// const HeaderSwitcher = () => {
//     const [userRole, setUserRole] = useState(null); // Estado para armazenar o tipo de usuário

//     useEffect(() => {
//         // Lógica para determinar o tipo de usuário
//         // Isso pode vir de um cookie, localStorage, ou de um contexto de autenticação
//         const usuarioData = localStorage.getItem('usuario'); // Exemplo: pegando do localStorage
//         if (usuarioData) {
//             try {
//                 const usuario = JSON.parse(usuarioData);
//                 setUserRole(usuario.role); // Supondo que 'usuario' tem uma propriedade 'role'
//             } catch (error) {
//                 console.error("Erro ao fazer parse dos dados do usuário:", error);
//                 setUserRole('public'); // Define um role padrão em caso de erro
//             }
//         } else {
//             setUserRole('public'); // Usuário não logado ou sem dados
//         }
//     }, []); // Executa apenas uma vez no montagem do componente

//     if (userRole === null) {
//         // Opcional: Mostrar um loader ou nada enquanto o role é determinado
//         return null;
//     }

//     switch (userRole) {
//         case 'responsavel':
//             return <HeaderAluno/>
//         case 'aluno':
//             return <HeaderAluno />;
//         case 'coordenador':
//             return <HeaderCoordenador />;
//         case 'cre':
//             return <HeaderCRE />;
//         case 'externo':
//             return <HeaderExterno/>
//         // Adicione outros cases conforme necessário para outros papéis
//         case 'public': // Para usuários não logados ou página de login
//         default:
//             return <HeaderPadrao />; // Header padrão ou de login
//     }
// };

// export default HeaderSwitcher;
*/
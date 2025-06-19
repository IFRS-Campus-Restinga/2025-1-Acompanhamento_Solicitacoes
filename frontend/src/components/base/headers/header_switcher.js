// src/components/base/headers/HeaderSwitcher.js
import { useEffect, useState } from 'react';
import HeaderAluno from './header_aluno';
import HeaderCoordenador from './header_coordenador';
import HeaderCRE from './header_cre';
import HeaderPadrao from './header_padrao'; // Assumindo que 'header.js' é o header padrão/de login

const HeaderSwitcher = () => {
    const [userRole, setUserRole] = useState(null); // Estado para armazenar o tipo de usuário

    useEffect(() => {
        // Lógica para determinar o tipo de usuário
        // Isso pode vir de um cookie, localStorage, ou de um contexto de autenticação
        const usuarioData = localStorage.getItem('usuario'); // Exemplo: pegando do localStorage
        if (usuarioData) {
            try {
                const usuario = JSON.parse(usuarioData);
                setUserRole(usuario.role); // Supondo que 'usuario' tem uma propriedade 'role'
            } catch (error) {
                console.error("Erro ao fazer parse dos dados do usuário:", error);
                setUserRole('public'); // Define um role padrão em caso de erro
            }
        } else {
            setUserRole('public'); // Usuário não logado ou sem dados
        }
    }, []); // Executa apenas uma vez no montagem do componente

    if (userRole === null) {
        // Opcional: Mostrar um loader ou nada enquanto o role é determinado
        return null;
    }

    switch (userRole) {
        case 'aluno':
            return <HeaderAluno />;
        case 'coordenador':
            return <HeaderCoordenador />;
        case 'cre':
            return <HeaderCRE />;
        // Adicione outros cases conforme necessário para outros papéis
        case 'public': // Para usuários não logados ou página de login
        default:
            return <HeaderPadrao />; // Header padrão ou de login
    }
};

export default HeaderSwitcher;
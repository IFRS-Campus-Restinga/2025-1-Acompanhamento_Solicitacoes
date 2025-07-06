import { useEffect, useState } from 'react';
import { getCookie } from '../../../services/authUtils'; // Importe getCookie do seu AuthUtils.js

// Importa todos os componentes de cabeçalho específicos
import HeaderAluno from './header_aluno';
import HeaderCoordenador from './header_coordenador';
import HeaderCRE from './header_cre';
import HeaderExterno from './header_externo';
import HeaderPadrao from './header_padrao'; // Cabeçalho padrão para usuários não identificados

const HeaderSwitcher = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        let detectedRole = 'public'; // Valor padrão

        // Tenta ler a 'role' do cookie 'userRole'
        const storedUserRole = getCookie('userRole');

        if (storedUserRole) {
            detectedRole = storedUserRole;
            console.log(`[HeaderSwitcher] Role recuperada do cookie 'userRole': "${storedUserRole}".`);
        } else {
            // Fallback: Se não encontrou no cookie, assume 'public'
            console.log(`[HeaderSwitcher] Cookie 'userRole' não encontrado, usando padrão: "${detectedRole}".`);
        }

        setUserRole(detectedRole);

    }, []); // O efeito é executado apenas uma vez na montagem do componente

    if (userRole === null) {
        return null;
    }

    switch (userRole) {
        case 'responsavel':
            return <HeaderAluno />;
        case 'aluno':
            return <HeaderAluno />;
        case 'coordenador':
            return <HeaderCoordenador />;
        case 'cre':
            return <HeaderCRE />;
        case 'externo':
            return <HeaderExterno />;
        case 'public':
        default:
            return <HeaderPadrao />;
    }
};

export default HeaderSwitcher;

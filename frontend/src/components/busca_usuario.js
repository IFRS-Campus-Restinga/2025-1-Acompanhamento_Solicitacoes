import { useEffect, useState } from "react";
import { getGoogleUser, removeCookie } from "../services/authUtils"; // Ajuste o caminho conforme necessário

export default function BuscaUsuario({ dadosUsuario }) {
    const [userData, setUserData] = useState(undefined);
    const [isAuthenticating, setIsAuthenticating] = useState(true); // Novo estado para controlar o carregamento inicial

    useEffect(() => {
        const fetchUserFromCookies = () => {
            setIsAuthenticating(true); // Inicia o carregamento
            const userFromCookie = getGoogleUser(); // Usa a função do authUtils
            
            if (userFromCookie) {
                setUserData(userFromCookie);
            } else {
                // Se não houver usuário nos cookies, limpa qualquer resquício antigo
                // (opcional, mas bom para garantir a consistência)
                removeCookie('googleUser');
                removeCookie('appToken');
                setUserData(null);
            }
            setIsAuthenticating(false); // Finaliza o carregamento
        };

        fetchUserFromCookies(); // Chama a função na montagem do componente

        // Não é mais necessário escutar o evento 'storage' se tudo estiver em cookies,
       
    }, []); 

    // Notifica o componente pai após a leitura
    useEffect(() => {
        // Só chama dadosUsuario se userData for diferente de undefined (ou seja, já tentou buscar)
        // e isAuthenticating for falso (garante que a busca inicial terminou).
        if (!isAuthenticating && userData !== undefined) {
            console.log("Dados do usuário lidos:", userData);
            dadosUsuario(userData); // Passa os dados para o componente pai
        }
    }, [userData, dadosUsuario, isAuthenticating]);

    // Este componente não renderiza nada diretamente, ele apenas lida com a lógica de busca de usuário.
    return null;
}

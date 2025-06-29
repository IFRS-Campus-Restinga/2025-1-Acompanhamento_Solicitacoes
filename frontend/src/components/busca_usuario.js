import { useEffect, useState } from "react";
// Importe a sua instância do Axios e a função de pegar o cookie
import api from "../services/api"; 
import { getGoogleUser, getAuthToken } from "../services/authUtils";

export default function BuscaUsuario({ dadosUsuario }) {
    const [isAuthenticating, setIsAuthenticating] = useState(true);

    useEffect(() => {
        const fetchFullUserProfile = async () => {
            setIsAuthenticating(true);
            
            // 1. Pega os dados básicos do cookie
            const userFromCookie = getGoogleUser();

            // Se não houver nem usuário no cookie, não há o que fazer.
            if (!userFromCookie?.email) {
                dadosUsuario(null);
                setIsAuthenticating(false);
                return;
            }

            const token = getAuthToken();
            if (!token) {
                // Se não há token, não podemos buscar o perfil completo.
                dadosUsuario(userFromCookie); // Retorna apenas os dados do cookie
                setIsAuthenticating(false);
                return;
            }

            try {
                // 2. USA O EMAIL DO COOKIE PARA CHAMAR A SUA VIEW EXISTENTE
                const email = userFromCookie.email;
                const response = await api.get(
                    // Monta a URL para a sua UsuarioDetailByEmail
                    `/usuarios/buscar-por-email/${email}/`, 
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // 3. PASSA OS DADOS COMPLETOS (COM 'grupo_detalhes') PARA O COMPONENTE PAI
                console.log("DEBUG FRONTEND: Perfil completo recebido da API:", response.data);
                dadosUsuario(response.data);

            } catch (error) {
                console.error("Erro ao buscar perfil completo do usuário:", error);
                // Em caso de erro, retorna os dados básicos do cookie para não quebrar a tela
                dadosUsuario(userFromCookie);
            } finally {
                setIsAuthenticating(false);
            }
        };

        fetchFullUserProfile();
        
    }, [dadosUsuario]);

    // Este componente não renderiza nada diretamente.
    return null;
}

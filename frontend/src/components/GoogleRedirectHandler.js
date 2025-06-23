import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { setCookie } from '../services/authUtils';
import axios from 'axios';

const GoogleRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("GoogleRedirectHandler: useEffect iniciado."); 
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    console.log("GoogleRedirectHandler: Access Token da URL:", accessToken); 

    if (accessToken) {
      try {
        console.log("GoogleRedirectHandler: Tentando decodificar token..."); 
        const decodedToken = jwtDecode(accessToken);
        console.log("GoogleRedirectHandler: Token decodificado:", decodedToken); 
        const { email, name, picture } = decodedToken;

        if (email && name) {
          console.log("GoogleRedirectHandler: Claims email e name encontradas."); 
          
          // Armazenar dados do usuário e token em cookies seguros
          setCookie('googleUser', JSON.stringify({ name, email, picture }), 60);
          setCookie('appToken', accessToken, 60);
          
          console.log("GoogleRedirectHandler: Dados salvos em cookies seguros.");

          // Verificar se o email já existe no sistema e obter o grupo do usuário
          checkUserExistenceAndRedirect(email, accessToken);
        } else {
          console.error("GoogleRedirectHandler: Claims essenciais (email, name) não encontradas no token.");
          navigate('/');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("GoogleRedirectHandler: Erro ao decodificar o token ou processar os dados:", error);
        navigate('/');
        setIsLoading(false);
      }
    } else {
      console.error("GoogleRedirectHandler: Access token não encontrado na URL.");
      navigate('/');
      setIsLoading(false);
    }
  }, [location, navigate]);

  // Função para verificar se o usuário existe e redirecionar com base no grupo
  const checkUserExistenceAndRedirect = async (email, token) => {
    console.log("Tentando verificar usuário com email:", email);
    try {
      // Fazer uma requisição para verificar se o usuário existe e obter seu grupo
      // Usando a URL correta com o prefixo /auth/
      const response = await axios.get(`http://localhost:8000/auth/verificar-usuario/?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Resposta da API de verificação:", response.data);
      const { exists, groups } = response.data;

      if (exists) {
        console.log("GoogleRedirectHandler: Usuário existe no sistema. Grupos:", groups);
        
        // Redirecionar com base no grupo do usuário
        if (groups.includes('cre')) {
          console.log("GoogleRedirectHandler: Usuário é CRE. Redirecionando para /cre/gestao-sistema");
          navigate('/cre/gestao-sistema');
        } else if (groups.includes('coordenador')) {
          console.log("GoogleRedirectHandler: Usuário é Coordenador. Redirecionando para /coordenador/coordenador_home");
          navigate('/coordenador/coordenador_home');
        } else if (groups.includes('aluno') || groups.includes('externo') || groups.includes('responsavel')) {
          console.log("GoogleRedirectHandler: Usuário é Aluno/Externo/Responsável. Redirecionando para /aluno/nova-solicitacao");
          navigate('/aluno/nova-solicitacao');
        } else {
          // Caso não tenha um grupo específico, redirecionar para uma página padrão
          console.log("GoogleRedirectHandler: Usuário não tem grupo específico. Redirecionando para página padrão.");
          navigate('/usuarios/selecionargrupo');
        }
      } else {
        console.log("GoogleRedirectHandler: Usuário não existe no sistema. Redirecionando para cadastro.");
        
        // Verificar se é email institucional para decidir a rota de cadastro
        const ifrsEmailRegex = /@.*ifrs\..+/i;
        if (ifrsEmailRegex.test(email)) {
          console.log("GoogleRedirectHandler: E-mail IFRS detectado. Redirecionando para seleção de grupo...");
          navigate('/usuarios/selecionargrupo');
        } else {
          console.log("GoogleRedirectHandler: E-mail não IFRS. Redirecionando para cadastro geral...");
          navigate('/usuarios/cadastro');
        }
      }
    } catch (error) {
      console.error("Erro completo ao verificar usuário:", error);
      console.error("Resposta do servidor:", error.response?.data);
      console.error("Status do erro:", error.response?.status);
      
      // Em caso de erro, seguir o fluxo original
      const ifrsEmailRegex = /@.*ifrs\..+/i;
      if (ifrsEmailRegex.test(email)) {
        navigate('/usuarios/selecionargrupo');
      } else {
        navigate('/usuarios/cadastro');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-redirect-container">
      {isLoading ? (
        <div className="loading-message">
          <p>Processando login com Google...</p>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <p>Redirecionando...</p>
      )}
    </div>
  );
};

export default GoogleRedirectHandler;

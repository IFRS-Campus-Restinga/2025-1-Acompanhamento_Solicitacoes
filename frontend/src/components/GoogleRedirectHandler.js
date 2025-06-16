import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { setCookie } from '../services/authUtils'; // Importando a função utilitária

const GoogleRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
          
          // Armazenar dados do usuário e token em cookies seguros em vez de localStorage
          setCookie('googleUser', JSON.stringify({ name, email, picture }), 60);
          setCookie('appToken', accessToken, 60);
          
          console.log("GoogleRedirectHandler: Dados salvos em cookies seguros."); 

          const ifrsEmailRegex = /@.*ifrs\..+/i; 
          console.log("GoogleRedirectHandler: Testando regex para email:", email); 
          if (ifrsEmailRegex.test(email)) {
            console.log("GoogleRedirectHandler: E-mail IFRS detectado. Redirecionando para /grupos..."); 
            navigate('/usuarios/selecionargrupo');
          } else {
            console.log("GoogleRedirectHandler: E-mail não IFRS. Redirecionando para /usuarios..."); 
            navigate('/usuarios/cadastro');
          }
        } else {
          console.error("GoogleRedirectHandler: Claims essenciais (email, name) não encontradas no token.");
          navigate('/');
        }
      } catch (error) {
        console.error("GoogleRedirectHandler: Erro ao decodificar o token ou processar os dados:", error);
        navigate('/');
      }
    } else {
      console.error("GoogleRedirectHandler: Access token não encontrado na URL.");
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div>
      <p>Processando login com Google...</p>
    </div>
  );
};

export default GoogleRedirectHandler;

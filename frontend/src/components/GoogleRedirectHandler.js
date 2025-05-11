// GoogleRedirectHandler.js (com mais logs)
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
          localStorage.setItem('googleUser', JSON.stringify({ name, email, picture }));
          localStorage.setItem('appToken', accessToken);
          console.log("GoogleRedirectHandler: Dados salvos no localStorage."); 

          const ifrsEmailRegex = /@.*ifrs\..+/i; 
          console.log("GoogleRedirectHandler: Testando regex para email:", email); 
          if (ifrsEmailRegex.test(email)) {
            console.log("GoogleRedirectHandler: E-mail IFRS detectado. Redirecionando para /grupos..."); 
            navigate('/grupos');
          } else {
            console.log("GoogleRedirectHandler: E-mail não IFRS. Redirecionando para /usuarios..."); 
            navigate('/usuarios');
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

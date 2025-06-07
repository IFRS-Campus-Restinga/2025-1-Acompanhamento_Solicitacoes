import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function VerificadorDisponibilidade({ children, tipoFormulario }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verificarDisponibilidade = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/solicitacoes/disponibilidades/verificar/?formulario=${tipoFormulario}`
        );
        
        if (!res.data.disponivel) {
          navigate('/indisponivel', {
            state: {
              tipoFormulario,
              // *** CORREÇÃO AQUI: mude 'periodo' para 'periodos' ***
              periodos: res.data.periodos || [], // Garanta que 'periodos' do backend seja um array
              from: location.pathname
            },
            replace: true
          });
        }
      } catch (error) {
        // Você pode querer passar mais detalhes do erro se o backend fornecer
        // Ex: error.response?.data?.detail
        navigate('/indisponivel', {
          state: { error: true, tipoFormulario: tipoFormulario }, // Adicione tipoFormulario para melhor mensagem de erro
          replace: true
        });
      }
    };

    verificarDisponibilidade();
  }, [tipoFormulario, navigate, location]); // Adicione 'location' ao array de dependências para o useEffect

  return children;
}
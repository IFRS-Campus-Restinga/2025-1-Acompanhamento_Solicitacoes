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
              periodo: res.data.periodo,
              from: location.pathname
            },
            replace: true
          });
        }
      } catch (error) {
        navigate('/indisponivel', {
          state: { error: true },
          replace: true
        });
      }
    };

    verificarDisponibilidade();
  }, [tipoFormulario, navigate, location]);

  return children;
}
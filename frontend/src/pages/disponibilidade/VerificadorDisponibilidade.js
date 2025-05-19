import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerificadorDisponibilidade({ children, tipoFormulario }) {
  const navigate = useNavigate();

  const verificarDisponibilidade = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/disponibilidade/${tipoFormulario}/`
      );
      if (!res.data.disponivel) {
        navigate('../indisponivel', { 
          state: { tipoFormulario },
          replace: true 
        });
      }
    } catch (error) {
      navigate('../indisponivel', { 
        state: { error: true },
        replace: true
      });
    }
  }, [tipoFormulario, navigate]);

  useEffect(() => {
    verificarDisponibilidade();
  }, [verificarDisponibilidade]);

  return children;
}
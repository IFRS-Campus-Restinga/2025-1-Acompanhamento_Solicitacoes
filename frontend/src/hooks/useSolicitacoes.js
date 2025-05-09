// src/hooks/useSolicitacoes.js
import { useState, useEffect } from "react";
import api from "../services/api";

export default function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("todas-solicitacoes");
        setSolicitacoes(res.data);
      } catch (e) {
        setErro(e);
        console.error("Erro ao buscar solicitações:", e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return { solicitacoes, setSolicitacoes, carregando, erro };
}

// src/hooks/useBuscaPaginada.js
import { useMemo, useState, useEffect } from "react";

export default function useBuscaPaginada(dados, chaveFiltro = ["tipo", "status"]) {
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [dadosPaginados, setDadosPaginados] = useState([]);

  const dadosFiltrados = useMemo(() => {
    return dados.filter((item) =>
      chaveFiltro.some((chave) =>
        item[chave]?.toLowerCase().includes(filtro.toLowerCase())
      )
    );
  }, [dados, filtro, chaveFiltro]);

  useEffect(() => {
    setPaginaAtual(1); // volta para página 1 ao filtrar
  }, [filtro]);

  return {
    filtro,
    setFiltro,
    paginaAtual,
    setPaginaAtual,
    dadosPaginados,
    setDadosPaginados,
    dadosFiltrados,
  };
}

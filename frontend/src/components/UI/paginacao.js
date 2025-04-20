import React, { useMemo } from "react";
import "./paginacao.css";

export default function Paginacao({ dados, paginaAtual, setPaginaAtual, itensPorPagina = 5, onDadosPaginados }) {
  const totalPaginas = Math.ceil(dados.length / itensPorPagina);

  const dadosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return dados.slice(inicio, fim);
  }, [dados, paginaAtual, itensPorPagina]);

  // Passa os dados paginados para o componente pai
  React.useEffect(() => {
    onDadosPaginados(dadosPaginados);
  }, [dadosPaginados, onDadosPaginados]);

  return (
    <div className="paginacao">
      {paginaAtual > 1 && (
        <button onClick={() => setPaginaAtual(paginaAtual - 1)}>Anterior</button>
      )}

      <span>Página {paginaAtual} de {totalPaginas}</span>

      {paginaAtual < totalPaginas && (
        <button onClick={() => setPaginaAtual(paginaAtual + 1)}>Próxima</button>
      )}
    </div>
  );
}

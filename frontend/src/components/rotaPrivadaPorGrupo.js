// src/components/RotaPrivadaPorGrupo.js
import { Navigate } from "react-router-dom";

export default function RotaPrivadaPorGrupo({ grupoUsuario, gruposPermitidos, children }) {
  // 1. Caso: grupoUsuario ainda não foi carregado ou é nulo/indefinido (usuário não autenticado).
  // Redireciona para a página inicial. O 'replace' evita que a página restrita fique no histórico do navegador.
  if (!grupoUsuario) {
    return <Navigate to="/" replace />;
  }

  // 2. Caso: grupoUsuario está definido, mas não possui permissão para esta rota específica.
  // Redireciona para a página de erro 403 (Acesso Negado).
  if (!gruposPermitidos.includes(grupoUsuario)) {
    return <Navigate to="/erro403" replace />;
  }

  // 3. Caso: grupoUsuario está definido E possui permissão.
  // Renderiza o componente filho (a página real).
  return children;
}
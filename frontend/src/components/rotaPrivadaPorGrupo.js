// src/components/RotaPrivadaPorGrupo.js
import { Navigate } from "react-router-dom";

export default function RotaPrivadaPorGrupo({ grupoUsuario, gruposPermitidos, children }) {
  console.log("--- RotaPrivadaPorGrupo ---");
  console.log("grupoUsuario:", grupoUsuario);
  console.log("gruposPermitidos:", gruposPermitidos);

  // Se 'gruposPermitidos' não for fornecido, assume que a rota é para usuários autenticados em geral.
  const isPublicAuthenticatedRoute = !gruposPermitidos || gruposPermitidos.length === 0;
  console.log("isPublicAuthenticatedRoute:", isPublicAuthenticatedRoute);

  // 1. Caso: grupoUsuario ainda não foi carregado ou é nulo/indefinido (usuário não autenticado).
  if (!grupoUsuario && !isPublicAuthenticatedRoute) {
    console.log("Cenário 1: Usuário não autenticado e rota não é pública para autenticados. Redirecionando para /");
    return <Navigate to="/" replace />;
  }

  // 2. Caso: Usuário autenticado, mas sem permissão específica para esta rota.
  if (!isPublicAuthenticatedRoute && !gruposPermitidos.includes(grupoUsuario)) {
    console.log("Cenário 2: Usuário autenticado sem permissão. Redirecionando para /erro403");
    return <Navigate to="/erro403" replace />;
  }

  // 3. Caso: Usuário autenticado e com permissão, ou rota pública para autenticados.
  console.log("Cenário 3: Acesso permitido.");
  return children;
}

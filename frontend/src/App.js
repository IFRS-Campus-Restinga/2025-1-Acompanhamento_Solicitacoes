import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { verificarGrupo } from "./services/authUtils";
import HeaderSwitcher from "./components/base/headers/header_switcher";
import MainContent from "./components/base/main_content";
import Footer from "./components/base/footer";
import GoogleRedirectHandler from "./components/GoogleRedirectHandler";
import Home from "./pages/home";
import RotasPorGrupoConfig from "./routes/routes";
import Erro403 from "./pages/erro403";
import RotaPrivadaPorGrupo from "./components/rotaPrivadaPorGrupo";

function App() {
  const [grupo, setGrupo] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarGrupo = async () => {
      try {
        const grupoDetectado = await verificarGrupo();
        setGrupo(grupoDetectado);
        console.log(grupo);
      } catch (error) {
        console.error("Erro ao verificar grupo:", error);
        setGrupo(null); // Assume no group if there's an error
      } finally {
        setCarregando(false);
      }
    };

    carregarGrupo();
  }, [grupo]);

  if (carregando) {
    return <p>Carregando...</p>;
  }

  // Get the route configurations based on the detected group.
  // This function returns an array of route objects: { path, element, gruposPermitidos, key }.
  const rotasDoGrupo = RotasPorGrupoConfig(grupo);

  return (
    <Router>
      <div id="root">
        <HeaderSwitcher />
        <MainContent>
          <Routes>
            {/* Rotas públicas acessíveis por qualquer usuário, mesmo não autenticado */}
            <Route path="/auth/google/redirect-handler" element={<GoogleRedirectHandler />} />
            <Route path="/" element={<Home />} />
            <Route path="/erro403" element={<Erro403 />} /> {/* Rota específica para acesso negado */}

            {/* Renderiza as rotas protegidas pelo grupo.
                Cada rota é envolvida por RotaPrivadaPorGrupo, que gerencia a permissão
                e redireciona para /erro403 ou / (se não autenticado) conforme necessário. */}
            {rotasDoGrupo.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={
                  <RotaPrivadaPorGrupo
                    grupoUsuario={grupo}
                    // 'gruposPermitidos' é um array de grupos que podem acessar esta rota específica.
                    gruposPermitidos={route.gruposPermitidos}
                  >
                    {route.element}
                  </RotaPrivadaPorGrupo>
                }
              />
            ))}

            {/* Rota fallback (catch-all) para qualquer path não correspondente.
                Esta deve ser a ÚLTIMA rota definida para garantir que todas as rotas específicas
                acima sejam verificadas primeiro. */}
            <Route
              path="*"
              element={grupo ? <Navigate to="/erro403" replace /> : <Navigate to="/" replace />}
            />
          </Routes>
        </MainContent>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
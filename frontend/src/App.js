import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { verificarGrupo, getAuthToken, isAuthenticated, logout } from "./services/authUtils";
import HeaderSwitcher from "./components/base/headers/header_switcher";
import MainContent from "./components/base/main_content";
import Footer from "./components/base/footer";
import GoogleRedirectHandler from "./components/GoogleRedirectHandler";
import Home from "./pages/home";
import RotasPorGrupoConfig from "./routes/routes";
import Erro403 from "./pages/erro403";
import RotaPrivadaPorGrupo from "./components/rotaPrivadaPorGrupo";
import CadastrarAtualizarUsuario from "./pages/usuarios/cadastrar_atualizar_usuarios";
import CadastrarAtualizarUsuarioGrupo from "./pages/usuarios/cadastrar_atualizar_usuarios_grupos";

function App() {
  const [grupo, setGrupo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [currentAuthToken, setCurrentAuthToken] = useState(getAuthToken());

  useEffect(() => {
    const carregarGrupoDoUsuario = async () => {
      setCarregando(true);
      try {
        if (currentAuthToken) {
          const grupoDetectado = await verificarGrupo();
          setGrupo(grupoDetectado);
          console.log("App.js: Grupo detectado pelo verificarGrupo:", grupoDetectado);
        } else {
          setGrupo(null);
          console.log("App.js: Nenhum token, grupo definido como null.");
        }
      } catch (error) {
        console.error("App.js: Erro ao verificar grupo:", error);
        setGrupo(null);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setCarregando(false);
        console.log("App.js: Carregamento finalizado.");
      }
    };

    carregarGrupoDoUsuario();
  }, [currentAuthToken]);

  if (carregando) {
    return <p>Carregando...</p>;
  }

  const rotasDoGrupo = RotasPorGrupoConfig(grupo);
  console.log("App.js: Rotas configuradas para o grupo:", rotasDoGrupo); // Para depuração

  return (
    <Router>
      <div id="root">
        <HeaderSwitcher grupo={grupo} isAuthenticated={isAuthenticated()} />
        <MainContent>
          <Routes>
            {/* Rotas públicas acessíveis por qualquer usuário, mesmo não autenticado */}
            <Route path="/auth/google/redirect-handler" element={<GoogleRedirectHandler />} />
            <Route path="/" element={<Home />} /> 
            <Route path="/erro403" element={<Erro403 />} />
            <Route path="/usuarios/cadastro" element={<CadastrarAtualizarUsuario />} />
            <Route path="/usuarios/cadastro/:grupo" element={<CadastrarAtualizarUsuarioGrupo />} />

            {/* Renderiza as rotas protegidas pelo grupo. */}
            {rotasDoGrupo.map((route) => (
              <Route
                key={route.props.key}
                path={route.props.path} 
                element={
                  <RotaPrivadaPorGrupo
                    grupoUsuario={grupo}
                    gruposPermitidos={route.props.gruposPermitidos} 
                  >
                    {route.props.element} 
                  </RotaPrivadaPorGrupo>
                }
              />
            ))}

            {/* Rota fallback (catch-all) */}
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

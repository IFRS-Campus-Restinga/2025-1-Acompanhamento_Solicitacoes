import "./botoes.css";


const BotaoGoogleLogin = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login";
  };

  return (
    <button onClick={handleLogin} className="botao-google">
    <img src="https://img.icons8.com/?size=512&id=17949&format=png" alt="Google Logo" className="icone-google" />
      Entrar com Google
    </button>
  );
};

export default BotaoGoogleLogin;

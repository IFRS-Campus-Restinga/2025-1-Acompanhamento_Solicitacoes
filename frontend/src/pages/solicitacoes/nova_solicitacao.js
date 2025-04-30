import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import "./../configuracoes/cruds";

const NovaSolicitacao = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/solicitacoes/")
      .then((res) => setSolicitacoes(res.data))
      .catch((err) => console.error("Erro ao buscar solicitações:", err));
  }, []);

  /* COLOCAR FUTURAMENTE NO CODIGO
  const NovaSolicitacao = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Aqui você vai buscar o usuário logado
      const userInfo = JSON.parse(localStorage.getItem('usuario')); // Ajustar conforme onde está salvo
      if (userInfo) {
        setUsuario(userInfo);
      } else {
        navigate("/"); // Se não tiver usuário logado, manda pra home (ou login)
      }
    }, [navigate]);
  
    useEffect(() => {
      if (usuario && usuario.grupo !== "Aluno") { // Ajuste o campo correto ("grupo", "role", "perfil"...)
        alert("Acesso restrito: apenas alunos podem solicitar.");
        navigate("/"); // Ou para onde você quiser
      }
    }, [usuario, navigate]);
  
    useEffect(() => {
      axios.get("http://127.0.0.1:8000/solicitacoes/")
        .then(res => setSolicitacoes(res.data))
        .catch(err => console.error("Erro ao buscar solicitações:", err));
    }, []);
  
    if (!usuario || usuario.grupo !== "Aluno") {
      return null; // Enquanto não validar o usuário, não renderiza nada
    }
*/
  return (
    <div>
      <Header />
      <main className="container">
        <h2>Solicitações Disponíveis</h2>
        <div className="grid-cruds">
          <Link className="crud-link" to="/trancamento_matricula">
            <i className="bi bi-box-arrow-right"></i> Solicitação de Trancamento
            de Matrícula
          </Link>

          <Link className="crud-link" to="/trancamento_disciplina">
            <i className="bi bi-x-circle"></i> Solicitação de Trancamento de
            Componente Curricular
          </Link>
          {/* FORMULARIO EXERCICIOS DOMICILIARES */}

          <Link className="crud-link" to="/exercicio_domiciliar">
            <i className="bi bi-house-check-fill"></i> Solicitação de Exercício
            Domiciliar
          </Link>

          <Link className="crud-link" to="/abono_falta">
            <i className="bi bi-calendar-x-fill"></i> Solicitação de Abono de
            Falta
          </Link>

          <Link className="crud-link" to="/dispensa_ed_fisica">
          <i class="bi bi-person-arms-up"></i> Solicitação de Dispensa de Educação Física
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NovaSolicitacao;

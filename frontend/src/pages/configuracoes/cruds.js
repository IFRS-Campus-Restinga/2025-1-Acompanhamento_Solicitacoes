import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";

//CSS
import "../../components/styles/telas_opcoes.css";

const Cruds = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/")
      .then(res => setSolicitacoes(res.data))
      .catch(err => console.error("Erro ao buscar solicitações:", err));
  }, []);

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <div className="grid-opcoes">
          <Link className="link_botao_escolha" to="/usuarios">
            <i className="bi bi-person-circle"></i> Usuários Ativos
          </Link>
          <Link className="link_botao_escolha" to="/usuarios/inativos">
            <i className="bi bi-person-circle"></i> Usuários Inativos
          </Link>
          <Link className="link_botao_escolha" to="/usuarios/selecionargrupo">
            <i className="bi bi-person-circle"></i> Cadastro Aluno/CRE/Coordenador
          </Link>         
          <Link className="link_botao_escolha" to="/mandatos">
            <i className="bi bi-person-circle"></i>  Mandatos
          </Link>
          <Link className="link_botao_escolha" to="/grupos">
            <i className="bi bi-people-fill"></i> Grupos
          </Link>
          <Link className="link_botao_escolha" to="/turmas">
            <i className="bi bi-people"></i> Turmas
          </Link>
          <Link className="link_botao_escolha" to="/disciplinas">
            <i className="bi bi-book"></i> Disciplinas
          </Link>
          <Link className="link_botao_escolha" to="/ppcs">
            <i className="bi bi-layout-text-window-reverse"></i> PPCs
          </Link>
          <Link className="link_botao_escolha" to="/cursos">
            <i className="bi bi-mortarboard"></i> Cursos
          </Link>
          <Link className="link_botao_escolha" to="/disponibilidades">
            <i className="bi bi-calendar-check"></i> Disponibilidade de Formulários
          </Link>
          <Link className="link_botao_escolha" to="/motivo_abono">
            <i className="bi bi-calendar-x-fill"></i> Abono de Faltas
          </Link>
          <Link className="link_botao_escolha" to="/motivo_exercicios">
            <i className="bi bi-journal-text"></i> Exercícios Domiciliares
          </Link>
          <Link className="link_botao_escolha" to="/motivo_dispensa">
            <i className="bi bi-person-arms-up"></i> Dispensa de Educação Física
          </Link>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cruds;

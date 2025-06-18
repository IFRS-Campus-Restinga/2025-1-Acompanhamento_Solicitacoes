import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function DetalhesUsuario() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8000/solicitacoes/usuarios/${id}/`)
      .then((res) => setUsuario(res.data))
      .catch((err) => {
        setErro(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Não foi possível carregar o usuário."}`);
      });
  }, [id]);

  return (
    <div>
      <main className="container">
        <h2>Detalhes do Usuário</h2>

        {erro && <p className="erro">{erro}</p>}

        {!erro && !usuario && <p>Carregando...</p>}

        {usuario && (
          <div className="detalhes-usuario">
            <p><strong>Nome:</strong> {usuario.nome}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>CPF:</strong> {usuario.cpf}</p>
            <p><strong>Telefone:</strong> {usuario.telefone}</p>
            <p><strong>Data de Nascimento:</strong> {usuario.data_nascimento}</p>
            <p><strong>Tipo de Usuário:</strong> {usuario.grupo === "Responsavel" ? "Responsável" : usuario.grupo}</p>

            {usuario.grupo === "Coordenador" && (
              <>
                <p><strong>SIAPE:</strong> {usuario.grupo_detalhes?.siape}</p>
                {(() => {
                  const mandatos = usuario.grupo_detalhes?.mandatos_coordenador || [];
                  if (mandatos.length === 0) {
                    return <p><em>Sem mandatos registrados.</em></p>;
                  }
                  return mandatos.map((mandato, idx) => (
                    <div key={idx}>
                      <p><strong>Curso:</strong> {mandato.curso}</p>
                      <p><strong>Início do Mandato:</strong> {mandato.inicio_mandato}</p>
                      <p><strong>Fim do Mandato:</strong> {mandato.fim_mandato || "-"}</p>
                      <hr />
                    </div>
                  ));
                })()}
              </>
            )}

            {usuario.grupo === "CRE" && (
              <p><strong>SIAPE:</strong> {usuario.grupo_detalhes?.siape}</p>
            )}

            {usuario.grupo === "Aluno" && (
              <>
                <p><strong>Matrícula:</strong> {usuario.grupo_detalhes?.matricula}</p>
                <p><strong>Curso:</strong> {usuario.grupo_detalhes?.curso_nome}</p>
                <p><strong>Ano de Ingresso:</strong> {usuario.grupo_detalhes?.ano_ingresso}</p>
              </>
            )}

            {usuario.grupo === "Responsável" && (
              <>
                <p><strong>Responsável de:</strong> {usuario.grupo_detalhes?.aluno || "Nenhum aluno"}</p>
                <p><strong>E-mail do aluno:</strong> {usuario.grupo_detalhes?.email_aluno || "Não cadastrado"}</p>
              </>
            )}

            <div className="botao-voltar-wrapper">
              <button className="botao-voltar" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left-circle"></i> Voltar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
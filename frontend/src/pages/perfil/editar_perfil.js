import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../services/axiosInstance";
import { getGoogleUser } from "../../services/authUtils";

const EditarPerfil = () => {
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    id: null
  });

  const [dadosEspecificos, setDadosEspecificos] = useState({});
  const [tipo, setTipo] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchDadosUsuario = async () => {
      const user = getGoogleUser();
      if (!user?.email) {
        alert("Usuário não autenticado.");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${user.email}/`);
        const dados = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!dados) throw new Error("Dados de usuário não encontrados.");

        const tipoUsuario = dados.grupo?.toLowerCase();
        const dataFormatada = dados.data_nascimento?.split("T")[0] || "";

        setTipo(tipoUsuario);
        setDadosUsuario({
          id: dados.id,
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone || "",
          data_nascimento: dataFormatada
        });

        setDadosEspecificos(dados.grupo_detalhes?.ppc || {});
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        alert("Erro ao carregar dados do perfil.");
      } finally {
        setCarregando(false);
      }
    };

    fetchDadosUsuario();
  }, []);

  const handleChangeUsuario = (e) => {
    setDadosUsuario({ ...dadosUsuario, [e.target.name]: e.target.value });
  };

  const handleChangeEspecifico = (e) => {
    setDadosEspecificos({ ...dadosEspecificos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.data_nascimento) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    await axiosInstance.put(`solicitacoes/usuarios/${dadosUsuario.id}/`, dadosUsuario);

    if (tipo && dadosEspecificos) {
      const endpointMap = {
        aluno: `/alunos/${dadosUsuario.id}/`,
        coordenador: `/coordenadores/${dadosUsuario.id}/`,
        cre: `/cres/${dadosUsuario.id}/`
      };

      // Certifique-se de que ppc está presente
      if (!dadosEspecificos.ppc) {
        alert("Um PPC deve ser selecionado.");
        return;
      }

      await axios.patch(`http://localhost:8000/${endpointMap[tipo]}`, dadosEspecificos);
    }

    alert("Perfil atualizado com sucesso!");
    window.location.href = "/home";
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    alert("Erro ao atualizar dados.");
  }
};


  if (carregando) {
    return <main className="container text-center mt-5">Carregando dados do perfil...</main>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center fw-bold">
              Editar Perfil
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome:</label>
                  <input type="text" name="nome" value={dadosUsuario.nome} onChange={handleChangeUsuario} className="form-control" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input type="email" name="email" value={dadosUsuario.email} disabled className="form-control" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Telefone:</label>
                  <input type="text" name="telefone" value={dadosUsuario.telefone} onChange={handleChangeUsuario} className="form-control" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Data de Nascimento:</label>
                  <input type="date" name="data_nascimento" value={dadosUsuario.data_nascimento} disabled className="form-control" />
                </div>

                {tipo === "aluno" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Matrícula:</label>
                      <input type="text" name="matricula" value={dadosEspecificos.matricula || ""} disabled className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Turma:</label>
                      <input type="text" name="turma" value={dadosEspecificos.turma || ""} onChange={handleChangeEspecifico} className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ano de Ingresso:</label>
                      <input type="text" name="ano_ingresso" value={dadosEspecificos.ano_ingresso || ""} onChange={handleChangeEspecifico} className="form-control" />
                    </div>
                  </>
                )}

                {(tipo === "coordenador" || tipo === "cre") && (
                  <div className="mb-3">
                    <label className="form-label">SIAPE:</label>
                    <input type="text" name="siape" value={dadosEspecificos.siape || ""} disabled className="form-control" />
                  </div>
                )}

                <div className="text-center">
                  <button type="submit" className="btn btn-primary px-4">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;

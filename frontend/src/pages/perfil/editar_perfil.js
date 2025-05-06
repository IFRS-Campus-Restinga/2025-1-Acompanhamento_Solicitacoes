import axios from "axios";
import React, { useState } from "react";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import "./../../components/base/main.css";
import "./../../components/formulario.css";

const EditarPerfil = ({ dadosIniciais }) => {
      const [dadosUsuario, setDadosUsuario] = useState(dadosIniciais.usuario);
      const [dadosEspecificos, setDadosEspecificos] = useState(dadosIniciais[dadosIniciais.tipo] || {});
      const tipo = dadosIniciais.tipo;

      const handleChangeUsuario = (e) => {
        setDadosUsuario({ ...dadosUsuario, [e.target.name]: e.target.value });
      };
    
      const handleChangeEspecifico = (e) => {
        setDadosEspecificos({ ...dadosEspecificos, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
          await axios.put(`/usuarios/${dadosUsuario.id}/`, dadosUsuario);
    
          if (tipo && dadosEspecificos) {
            const endpointMap = {
              aluno: `/alunos/${dadosUsuario.id}/`,
              coordenador: `/coordenadores/${dadosUsuario.id}/`,
              cre: `/cres/${dadosUsuario.id}/`
            };
    
            await axios.put(endpointMap[tipo], dadosEspecificos);
          }
    
          alert("Dados atualizados com sucesso!");
        } catch (error) {
          console.error("Erro ao atualizar:", error);
          alert("Erro ao atualizar dados");
        }
      };

    
  return (
    <div>
      <Header />
      <main className="container">
        <h2>Editar Perfil</h2>
    
         <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded w-full max-w-lg mx-auto mt-6">
            <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

            <label className="block mb-2">Nome:</label>
            <input name="nome" value={dadosUsuario.nome} onChange={handleChangeUsuario} className="border p-2 w-full mb-4" />

            <label className="block mb-2">Email:</label>
            <input name="email" value={dadosUsuario.email} onChange={handleChangeUsuario} className="border p-2 w-full mb-4" />

            <label className="block mb-2">Telefone:</label>
            <input name="telefone" value={dadosUsuario.telefone} onChange={handleChangeUsuario} className="border p-2 w-full mb-4" />

            <label className="block mb-2">Data de Nascimento:</label>
            <input type="date" name="data_nascimento" value={dadosUsuario.data_nascimento} onChange={handleChangeUsuario} className="border p-2 w-full mb-4" />

            {tipo === "aluno" && (
              <>
                <label className="block mb-2">Matrícula:</label>
                <input name="matricula" value={dadosEspecificos.matricula} onChange={handleChangeEspecifico} className="border p-2 w-full mb-4" />

                <label className="block mb-2">Turma:</label>
                <input name="turma" value={dadosEspecificos.turma} onChange={handleChangeEspecifico} className="border p-2 w-full mb-4" />

                <label className="block mb-2">Ano de Ingresso:</label>
                <input name="ano_ingresso" value={dadosEspecificos.ano_ingresso} onChange={handleChangeEspecifico} className="border p-2 w-full mb-4" />
              </>
            )}

            {tipo === "coordenador" && (
              <>
                <label className="block mb-2">SIAPE:</label>
                <input name="siape" value={dadosEspecificos.siape} onChange={handleChangeEspecifico} className="border p-2 w-full mb-4" />
              </>
            )}

            {tipo === "cre" && (
              <>
                <label className="block mb-2">SIAPE:</label>
                <input name="siape" value={dadosEspecificos.siape} onChange={handleChangeEspecifico} className="border p-2 w-full mb-4" />
              </>
            )}

            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Salvar</button>
        </form>

        <div className="perfil">
         
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditarPerfil;

import EditarPerfil from './editar_perfil';

import React, { useEffect, useState } from 'react';
import axiosInstance from "./../../services/axiosInstance";

const Perfil = () => {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    axiosInstance.get('/perfil/')
    .then(response => {
      console.log("Dados do usuário:", response.data); // Veja o que está sendo retornado
      if (!response.data) throw new Error("Dados do usuário não encontrados");
      setDados(response.data);
    })
    .catch(error => console.error("Erro ao carregar perfil:", error));
}, []);

  if (!dados || !dados.usuario) {
    return <p>Erro ao carregar perfil.</p>;
  }
  return (
    <EditarPerfil dadosIniciais={dados} />
  );
};

export default Perfil;

import EditarPerfil from './editar_perfil';

import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Perfil = () => {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    axios.get('/perfil/')
      .then(response => setDados(response.data))
      .catch(error => console.error("Erro ao carregar perfil:", error));
  }, []);

  if (!dados) return <p>Carregando...</p>;

  return (
    <EditarPerfil dadosIniciais={dados} />
  );
};

export default Perfil;

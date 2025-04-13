import React from "react";
import { Route } from "react-router-dom";

// Páginas
import Cruds from "../pages/cruds/cruds.js";

// Motivos de Abono
import CadastrarAtualizarAbono from "../pages/motivos/abono/cadastrar_atualizar_abono";
import ListarMotivosAbono from "../pages/motivos/abono/lista_abono";

// Motivos de Exercícios
import CadastrarAtualizarExercicios from "../pages/motivos/exercicios/cadastrar_atualizar_exercicios";
import ListarMotivosExercicios from "../pages/motivos/exercicios/lista_motivo_exercicios";

const routes = [
  <Route path="/" element={<Cruds />} key="home" />,

  // Motivo Abono
  <Route path="/motivo_abono" element={<ListarMotivosAbono />} key="listar-abono" />,
  <Route path="/motivo_abono/cadastrar" element={<CadastrarAtualizarAbono />} key="cadastrar-abono" />,
  <Route path="/motivo_abono/:id" element={<CadastrarAtualizarAbono />} key="editar-abono" />,

  // Motivo Exercícios
  <Route path="/motivo_exercicios" element={<ListarMotivosExercicios />} key="listar-exercicios" />,
  <Route path="/motivo_exercicios/cadastrar" element={<CadastrarAtualizarExercicios />} key="cadastrar-exercicios" />,
  <Route path="/motivo_exercicios/:id" element={<CadastrarAtualizarExercicios />} key="editar-exercicios" />,
];

export default routes;

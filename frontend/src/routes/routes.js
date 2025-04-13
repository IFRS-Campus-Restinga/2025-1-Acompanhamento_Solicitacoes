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

// Motivos de Dispensa de Educação Física

import ListaMotivosDispensa from "../pages/motivos/dispensa_ed_fisica/lista_motivo.js"

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

  // Motivo Dispensa de Educação Física
  <Route path="/motivo_dispensa" element={<ListaMotivosDispensa />} key="listar-dispensa" />,
  // Disciplinas
  <Route path="/disciplinas" element={<ListarDisciplinas />} key="listar-disciplinas" />,
  <Route path="/disciplinas/cadastrar" element={<CadastrarAtualizarDisciplina />} key="cadastrar-disciplinas" />,
  <Route path="/disciplinas/:id" element={<CadastrarAtualizarDisciplina />} key="editar-disciplinas" />,

  // Turmas
  <Route path="/turmas" element={<ListarTurmas />} key="listar-turmas" />,
  <Route path="/turmas/cadastrar" element={<CadastrarAtualizarTurma />} key="cadastrar-turmas" />,
  <Route path="/turmas/:id" element={<CadastrarAtualizarTurma />} key="editar-turmas" />
];

export default routes;

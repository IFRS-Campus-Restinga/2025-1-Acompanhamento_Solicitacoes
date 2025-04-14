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

// Disciplinas
import CadastrarAtualizarDisciplina from "../pages/disciplinas/cadastrar_atualizar_disciplina";
import ListarDisciplinas from "../pages/disciplinas/lista_disciplina";

// Turmas
import CadastrarAtualizarTurma from "../pages/turmas/cadastrar_atualizar_turma";
import ListarTurmas from "../pages/turmas/lista_turma";

// Cursos
import ListarCursos from "../pages/cursos/lista_cursos";                 // página para listar cursos
import CadastrarAtualizarCursos from "../pages/cursos/cadastrar_atualizar_cursos"; // página para cadastrar/atualizar cursos

// // PPC
import ListarPpc from "../pages/ppcs/lista_ppc";                           // página para listar PPCs
import CadastrarAtualizarPpc from "../pages/ppcs/cadastrar_atualizar_ppc"; // página para cadastrar/atualizar PPCs

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

  // Disciplinas
  <Route path="/disciplinas" element={<ListarDisciplinas />} key="listar-disciplinas" />,
  <Route path="/disciplinas/cadastrar" element={<CadastrarAtualizarDisciplina />} key="cadastrar-disciplinas" />,
  <Route path="/disciplinas/:id" element={<CadastrarAtualizarDisciplina />} key="editar-disciplinas" />,

  // Turmas
  <Route path="/turmas" element={<ListarTurmas />} key="listar-turmas" />,
  <Route path="/turmas/cadastrar" element={<CadastrarAtualizarTurma />} key="cadastrar-turmas" />,
  <Route path="/turmas/:id" element={<CadastrarAtualizarTurma />} key="editar-turmas" />,

  // Cursos
  <Route path="/cursos" element={<ListarCursos />} key="listar-cursos" />,
  <Route path="/cursos/cadastrar" element={<CadastrarAtualizarCursos />} key="cadastrar-cursos" />,
  <Route path="/cursos/:codigo" element={<CadastrarAtualizarCursos />} key="editar-cursos" />,

  // // PPC
  <Route path="/ppcs" element={<ListarPpc />} key="listar-ppc" />,
  <Route path="/ppcs/cadastrar" element={<CadastrarAtualizarPpc />} key="cadastrar-ppc" />,
  <Route path="/ppcs/:codigo" element={<CadastrarAtualizarPpc />} key="editar-ppc" />
];

export default routes;

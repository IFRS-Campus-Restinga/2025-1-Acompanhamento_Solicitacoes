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

import CadastrarAtualizarMotivoDispensa from "../pages/motivos/dispensa_ed_fisica/cadastrar_atualizar_motivo.js";
import ListaMotivosDispensa from "../pages/motivos/dispensa_ed_fisica/lista_motivo.js";

// Disciplinas

import CadastrarAtualizarDisciplina from "../pages/disciplinas/cadastrar_atualizar_disciplina.js";
import ListarDisciplinas from "../pages/disciplinas/lista_disciplina.js";

// Turmas

import CadastrarAtualizarTurma from "../pages/turmas/cadastrar_atualizar_turma.js";
import ListarTurmas from "../pages/turmas/lista_turma.js";

// Cursos
import CadastrarAtualizarCursos from "../pages/cursos/cadastrar_atualizar_cursos"; // página para cadastrar/atualizar cursos
import ListarCursos from "../pages/cursos/lista_cursos"; // página para listar cursos

// // PPC
import CadastrarAtualizarPpc from "../pages/ppcs/cadastrar_atualizar_ppc"; // página para cadastrar/atualizar PPCs
import ListarPpc from "../pages/ppcs/lista_ppc"; // página para listar PPCs

// Usuarios
import CadastrarAtualizarUsuario from "../pages/usuarios/cadastrar_atualizar_usuarios.js";
import DetalhesUsuario from "../pages/usuarios/detalhes_usuario.js";
import ListarUsuarios from "../pages/usuarios/lista_usuarios.js";

//Grupos
import CadastrarAtualizarGrupo from "../pages/grupos/cadastrar_atualizar_grupo.js";
import ListarGrupos from "../pages/grupos/lista_grupo.js";

//Dispensa Educação Física
import DispensaEdFisica from "../pages/forms/dispensa_ed_fisica/formulario.js";

// Formulário de Trancamento de Disciplinas
import Formulario from "../pages/forms/trancamento_disciplina/formulario";
import FormTrancDisciplina from "../pages/forms/trancamento_disciplina/formulario.js";

// Formulário de Abono de Falta
import AbonoFalta from "../pages/forms/abono_falta/formulario_abono_falta.js";

//Coordenadores

import FormExercicioDomiciliar from '../pages/forms/exercicios_domiciliares/formulario';

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
  <Route path="/motivo_dispensa/cadastrar" element={<CadastrarAtualizarMotivoDispensa />} key="cadastrar-motivos-dispensa" />,
  <Route path="/motivo_dispensa/:id" element={<CadastrarAtualizarMotivoDispensa />} key="atualizar-motivos-dispensa" />,

  // Disciplinas
  <Route path="/disciplinas" element={<ListarDisciplinas />} key="listar-disciplinas" />,
  <Route path="/disciplinas/cadastrar" element={<CadastrarAtualizarDisciplina />} key="cadastrar-disciplinas" />,
  <Route path="/disciplinas/:codigo" element={<CadastrarAtualizarDisciplina />} key="editar-disciplinas" />,

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
  <Route path="/ppcs/:codigo" element={<CadastrarAtualizarPpc />} key="editar-ppc" />,

  // Usuarios
  <Route path="/usuarios" element={<ListarUsuarios />} key="listar-usuarios" />,
  <Route path="/usuarios/:id" element={<DetalhesUsuario />} />,
  <Route path="/usuarios/cadastrar" element={<CadastrarAtualizarUsuario />} key="cadastrar-usuarios" />,
  <Route path="/usuarios/editar/:id" element={<CadastrarAtualizarUsuario />} key="editar-usuarios" />,

  // Grupos
  <Route path="/grupos" element={<ListarGrupos />} />,
  <Route path="/grupos/cadastrar" element={<CadastrarAtualizarGrupo />} key="cadastrar-grupos" />,
  <Route path="/grupos/:id" element={<CadastrarAtualizarGrupo />} key="editar-grupos" />,

  // Formulário de Dispensa de Educação Física
  <Route path="/dispensa_ed_fisica" element={<DispensaEdFisica />} key="dispensa_ed_fisica" /> ,
 
  <Route path="/trancamento_disciplina" element={<FormTrancDisciplina />} key="trancamento_disciplina" />,
  <Route path="/formulario_trancamento_disciplina/disciplinas/:curso_codigo/" element={<Formulario />} />,

  <Route path="/abono_falta" element={<AbonoFalta />} key="abono_falta" />,

  <Route path="/exercicio_domiciliar" element={<FormExercicioDomiciliar />} key="exercicio_domiciliar" />

 ];

export default routes;

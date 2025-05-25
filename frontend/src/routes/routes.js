import { Route } from "react-router-dom";

// Páginas
import Configuracoes from "../pages/configuracoes/configuracoes.js";
import Perfil from "../pages/perfil/perfil.js";
//import PosLogin from "../pages/pos_login";

//import Cruds from "../pages/configuracoes/cruds.js";
import FormularioTrancamentoMatricula from "../pages/forms/trancamento_matricula/trancamento_matricula.js";
import ListarSolicitacoes from "../listar_solicitacoes.js";
import Home from "./../pages/home";


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
import CadastrarAtualizarUsuarioPapel from "../pages/usuarios/cadastrar_atualizar_usuarios_papeis.js";
import DetalhesUsuario from "../pages/usuarios/detalhes_usuario.js";
import ListarUsuarios from "../pages/usuarios/lista_usuarios.js";
import SelecionarPapelUsuario from "../pages/usuarios/selecionar_papel.js";

//Grupos
import CadastrarAtualizarGrupo from "../pages/grupos/cadastrar_atualizar_grupo.js";
import ListarGrupos from "../pages/grupos/lista_grupo.js";

//Dispensa Educação Física
import DispensaEdFisica from "../pages/forms/dispensa_ed_fisica/formulario.js";

// Formulário de Trancamento de Disciplinas
import Formulario from "../pages/forms/trancamento_disciplina/formulario";
import FormTrancDisciplina from "../pages/forms/trancamento_disciplina/formulario.js";

// Disponibilidade
import CadastrarAtualizarDisponibilidade from "../pages/disponibilidade/cadastrar_atualizar.js";
import FormularioIndisponivel from '../pages/disponibilidade/FormularioIndisponivel.js';
import ListarDisponibilidades from "../pages/disponibilidade/listar.js";
import VerificadorDisponibilidade from '../pages/disponibilidade/VerificadorDisponibilidade.js';

// Formulário de Abono de Falta
import AbonoFalta from "../pages/forms/abono_falta/formulario_abono_falta.js";

//Coordenadores

//Mandatos
import CadastrarAtualizarMandato from "../pages/coordenadores/mandatos/cadastrar_atualizar_mandatos.js";
import ListaMandatosPorCurso from "../pages/coordenadores/mandatos/lista_coord_mandato_por_curso.js";
import HistoricoMandatos from "../pages/coordenadores/mandatos/lista_mandatos.js";
import SelecaoCursoMandato from "../pages/coordenadores/mandatos/selecao_curso_mandatos.js";


import FormExercicioDomiciliar from '../pages/forms/exercicios_domiciliares/formulario';

//Form desistencia Vaga

import FormularioDesistenciaVaga from "../pages/forms/desistencia_vaga/formulario.js";

import { Navigate } from "react-router-dom";

// Importe o GoogleRedirectHandler
import GoogleRedirectHandler from "../components/GoogleRedirectHandler.js";

//Tela CRE
import DetalheSolicitacao from "../pages/telas_users/telas_cre/detalhe_solicitacao.js";
import HomeCRE from "../pages/telas_users/telas_cre/home_cre.js";

//Tela Coordenador
import HomeCoordenador from "../pages/telas_users/tela_coordenador/homecoordenador.js";

//Telas Aluno
import DetalhesSolicitacao from "../pages/telas_users/telas_aluno/aluno_detalhes_solicitacao";
import MinhasSolicitacoesAluno from "../pages/telas_users/telas_aluno/aluno_minhas_solicitacoes";
import AlunoNovaSolicitacao from "../pages/telas_users/telas_aluno/aluno_nova_solicitacao";

//Form Entrega de Atividades Complementares
import EntregaAtivCompl from "../pages/forms/entrega_ativ_compl/formulario.js";

const token = localStorage.getItem("token");

const routes = [
  // Rota para o GoogleRedirectHandler - Coloque esta rota antes de rotas genéricas ou de fallback
  <Route 
    path="/auth/google/redirect-handler" 
    element={<GoogleRedirectHandler />}
    key="google-redirect-handler"
  />,
  
  //página inicial
  <Route path="/" element={<Home />} key="home" />,

  <Route path="/configuracoes" element={<Configuracoes />} key="configuracoes" />,

  <Route path="/perfil" element={token ? <Perfil /> : <Navigate to="/" />} />,
  //<Route path="/pos-login" element={<PosLogin />} />,

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
  <Route path="/usuarios/selecionarpapel" element={<SelecionarPapelUsuario />} key="selecionar-papel-usuarios" />,
  <Route path="/usuarios/cadastro" element={<CadastrarAtualizarUsuario />} key="cadastrar-usuarios" />,
  <Route path="/usuarios/editar/:id" element={<CadastrarAtualizarUsuario />} key="editar-usuarios" />,
  <Route path="/usuarios/cadastro/:papel" element={<CadastrarAtualizarUsuarioPapel />} key="cadastrar-usuarios-papel" />,
  <Route path="/usuarios/editar/:papel/:id" element={<CadastrarAtualizarUsuarioPapel />} key="atualizar-usuarios-papel" />,

  
  //Mandatos

  <Route path="/mandatos-selecionarcurso" element={< SelecaoCursoMandato/>} key="selecionar-curso-mandato" />,
  <Route path="/mandatos/curso/:cursoCodigo" element={< ListaMandatosPorCurso/>} key="listar-mandatos-curso" />,
  <Route path="/mandatos/cadastrar" element={<CadastrarAtualizarMandato />} key="cadastrar-mandatos" />,
  <Route path="/mandatos/editar/:id" element={<CadastrarAtualizarMandato />} key="editar-mandatos" />,
  <Route path="/mandatos" element={<HistoricoMandatos/>} key="listar-historico-mandatos" />,


  // Grupos
  <Route path="/grupos" element={<ListarGrupos />} />,
  <Route path="/grupos/cadastrar" element={<CadastrarAtualizarGrupo />} key="cadastrar-grupos" />,
  <Route path="/grupos/:id" element={<CadastrarAtualizarGrupo />} key="editar-grupos" />,

  // Formulário de Dispensa de Educação Física
  <Route path="/dispensa_ed_fisica" element={<DispensaEdFisica />} key="dispensa_ed_fisica" /> ,
 
  <Route path="/trancamento_disciplina" element={<FormTrancDisciplina />} key="trancamento_disciplina" />,
  <Route path="/formulario_trancamento_disciplina/disciplinas/:curso_codigo/" element={<Formulario />} />,

  <Route path="/disponibilidades" element={<ListarDisponibilidades />} key="disponibilidade-listar" />,
  <Route path="/disponibilidades/cadastrar" element={<CadastrarAtualizarDisponibilidade />} key="disponibilidade-cadastrar" />,
  <Route path="/disponibilidades/:id" element={<CadastrarAtualizarDisponibilidade />} key="disponibilidade-editar" />,
  <Route path="/indisponivel" element={<FormularioIndisponivel />} key="indisponivel" />,
  <Route 
    path="formularios/:tipoFormulario"
    element={
      <VerificadorDisponibilidade>
        <FormularioTrancamentoMatricula />
      </VerificadorDisponibilidade>
    }
  />,

  <Route path="/abono_falta" element={<AbonoFalta />} key="abono_falta" />,

  <Route path="/exercicio_domiciliar" element={<FormExercicioDomiciliar />} key="exercicio_domiciliar" />,

  <Route path="/trancamento_matricula" element={<FormularioTrancamentoMatricula />} key="trancamento_matricula" />,

  //from desistencia vaga

  <Route path="/desistencia_vaga" element={<FormularioDesistenciaVaga />} key="desistencia_vaga" />,

  //Solicitacoes
  <Route path="/todas-solicitacoes" element={<ListarSolicitacoes />} key="solicitacao-list-create"/>,

  //TELAS USERS
  
  //Tela CRE
  <Route path="/cre/home" element={<HomeCRE />} key="home_cre" />,
  <Route path="/detalhe-solicitacao/:id" element={<DetalheSolicitacao />} key="detalhe_solicitacao" />,

  //Tela Coordenador
  <Route path="/coordenador_home" element={<HomeCoordenador />} key="home_coordenador" />,

  //Tela Aluno
  <Route path="/aluno/nova-solicitacao" element={<AlunoNovaSolicitacao/>} key="nova-solicitacao-aluno"/>,
  <Route path="/aluno/minhas-solicitacoes" element={<MinhasSolicitacoesAluno />} key="minhas-solicitacoes-aluno" />,
  <Route path="/aluno/detalhes-solicitacao/:id" element={<DetalhesSolicitacao />} key="detalhes-solicitacao-aluno" />,

  //Form de entrega de atividades complementares
  <Route path="/form_ativ_compl" element={<EntregaAtivCompl />} key="form_ativ_compl" />,
  <Route path="/cre_home" element={<HomeCRE />} key="home_cre" />,
  <Route path="/detalhe-solicitacao/:id" element={<DetalheSolicitacao />} key="detalhe_solicitacao" />,
  
 ];

export default routes;


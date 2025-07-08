// Este arquivo define as configurações de rotas para cada grupo de usuário.
// Ele retorna um array de objetos de rota, não componentes <Route> diretamente.

// Formulários
import AbonoFalta from "../pages/forms/abono_falta/formulario_abono_falta.js";
import FormularioDesistenciaVaga from "../pages/forms/desistencia_vaga/formulario_desistencia_vaga.js";
import DispensaEdFisica from "../pages/forms/dispensa_ed_fisica/formulario_dispensa_ed_fisica.js";
import EntregaAtivCompl from "../pages/forms/entrega_ativ_compl/formulario_ativ_compl.js";
import FormExercicioDomiciliar from '../pages/forms/exercicios_domiciliares/formulario_exerc_dom.js';
import { default as FormTrancDisciplina } from "../pages/forms/trancamento_disciplina/formulario_tranc_disc.js"; // Renomeado para evitar conflito
import Formulario from "../pages/forms/trancamento_disciplina/formulario_tranc_disc.js"; // Importado separadamente se for usado como Formulário
import FormularioTrancamentoMatricula from "../pages/forms/trancamento_matricula/formulario_trancamento_matricula.js";

// Páginas Comuns/Gerais
import Perfil from "../pages/perfil/editar_perfil.js";
import ListarSolicitacoes from "../listar_solicitacoes.js"; // Verifique se esta é usada, ou se é substituída por Solicitacoes
import Home from "./../pages/home"; // Geralmente, a Home não é uma rota protegida por grupo

// Motivos de Abono
import CadastrarAtualizarAbono from "../pages/motivos/abono/cadastrar_atualizar_abono";
import ListarMotivosAbono from "../pages/motivos/abono/listar_motivo_abono";

// Motivos de Exercícios
import CadastrarAtualizarExercicios from "../pages/motivos/exercicios/cadastrar_atualizar_exercicios";
import ListarMotivosExercicios from "../pages/motivos/exercicios/listar_motivo_exercicios";

// Motivos de Dispensa de Educação Física
import CadastrarAtualizarMotivoDispensa from "../pages/motivos/dispensa_ed_fisica/cadastrar_atualizar_motivo.js";
import ListaMotivosDispensa from "../pages/motivos/dispensa_ed_fisica/listar_motivo_dispensa.js";

// Disciplinas
import CadastrarAtualizarDisciplina from "../pages/disciplinas/cadastrar_atualizar_disciplina.js";
import ListarDisciplinas from "../pages/disciplinas/lista_disciplina.js";

// Turmas
import CadastrarAtualizarTurma from "../pages/turmas/cadastrar_atualizar_turma.js";
import ListarTurmas from "../pages/turmas/lista_turma.js";

// Cursos
import CadastrarAtualizarCursos from "../pages/cursos/cadastrar_atualizar_cursos";
import ListarCursos from "../pages/cursos/lista_cursos";

// PPC
import CadastrarAtualizarPpc from "../pages/ppcs/cadastrar_atualizar_ppc";
import ListarPpc from "../pages/ppcs/lista_ppc";

// Usuarios
import CadastrarAtualizarUsuario from "../pages/usuarios/cadastrar_atualizar_usuarios.js";
import CadastrarAtualizarUsuarioGrupo from "../pages/usuarios/cadastrar_atualizar_usuarios_grupos.js";
import DetalhesUsuario from "../pages/usuarios/detalhes_usuario.js";
import ListarUsuariosAtivos from "../pages/usuarios/listar_usuarios_ativos.js";
import ListarUsuariosInativos from "../pages/usuarios/listar_usuarios_inativos.js";
import SelecionarGrupoUsuario from "../pages/usuarios/selecionar_grupo.js";
import SelecionarGrupoGestaoSistema from "../pages/usuarios/selecionar_grupo_gestao_sistema.js";

// Grupos
import CadastrarAtualizarGrupo from "../pages/grupos/cadastrar_atualizar_grupo.js";
import ListarGrupos from "../pages/grupos/lista_grupo.js";

// Disponibilidade
import CadastrarAtualizarDisponibilidade from "../pages/disponibilidade/cadastrar_atualizar.js";
import FormularioIndisponivel from '../pages/disponibilidade/FormularioIndisponivel.js';
import ListarDisponibilidades from "../pages/disponibilidade/listar.js";
import VerificadorDisponibilidade from '../pages/disponibilidade/VerificadorDisponibilidade.js';

// Coordenadores - Mandatos
import CadastrarAtualizarMandato from "../pages/coordenadores/mandatos/cadastrar_atualizar_mandatos.js";
import HistoricoMandatos from "../pages/coordenadores/mandatos/lista_mandatos.js";

// Telas de Usuários Específicos (CRE, Coordenador, Aluno, Externo)
import GestaoSistema from "../pages/telas_users/telas_cre/gestao_sistema"; // CRE
import DetalheSolicitacaoCRE from "../pages/telas_users/telas_cre/detalhe_solicitacao.js"; // Renomeado para evitar conflito
import SolicitacoesFinalizadas from "../pages/telas_users/telas_cre/solicitacoes_finalizadas.js";
import TodasSolicitacoes from "../pages/telas_users/telas_cre/todas_solicitacoes.js";

import DetalhesSolicitacaoCoordenador from "../pages/telas_users/tela_coordenador/detalhe_solicitacao.js"; // Coordenador
import HomeCoordenador from "../pages/telas_users/tela_coordenador/homecoordenador.js";

import AlunoNovaSolicitacao from "../pages/telas_users/telas_aluno/aluno_nova_solicitacao";

import ExternoHome from "../pages/telas_users/tela_externo/externo_home.js";

// Gerenciamento de Exercícios Domiciliares
import GerenciarExercDomicilares from "../pages/exerc_domiciliares/gerenciar.js";

// Componente Genérico de Tabela de Solicitações
import Solicitacoes from "../pages/solicitacoes/tabelaSolicitacoes.js";
import DetalhesSolicitacao from "../pages/solicitacoes/detalheSolicitacao.js";

// Não precisa importar Route aqui, pois este arquivo apenas exporta configurações de rota.
// import { Route } from "react-router-dom"; // Não é necessário aqui

export default function RotasPorGrupo(grupo) {
  if (!grupo) {
    // Se o grupo não for definido, retorna um array vazio.
    // A lógica de redirecionamento para não-autenticados está no App.js
    return [];
  }

  let rotas = [];

  // Rotas da CRE
  if (grupo === "cre") {
    rotas = [
      { path: "/cre/gestao-sistema", element: <GestaoSistema />, gruposPermitidos: ["cre"], key: "cre-configuracoes" },
      { path: "/motivo_abono", element: <ListarMotivosAbono />, gruposPermitidos: ["cre"], key: "cre-listar-abono" },
      { path: "/motivo_abono/cadastrar", element: <CadastrarAtualizarAbono />, gruposPermitidos: ["cre"], key: "cre-cadastrar-abono" },
      { path: "/motivo_abono/:id", element: <CadastrarAtualizarAbono />, gruposPermitidos: ["cre"], key: "cre-editar-abono" },
      { path: "/motivo_exercicios", element: <ListarMotivosExercicios />, gruposPermitidos: ["cre"], key: "cre-listar-exercicios" },
      { path: "/motivo_exercicios/cadastrar", element: <CadastrarAtualizarExercicios />, gruposPermitidos: ["cre"], key: "cre-cadastrar-exercicios" },
      { path: "/motivo_exercicios/:id", element: <CadastrarAtualizarExercicios />, gruposPermitidos: ["cre"], key: "cre-editar-exercicios" },
      { path: "/motivo_dispensa", element: <ListaMotivosDispensa />, gruposPermitidos: ["cre"], key: "cre-listar-dispensa" },
      { path: "/motivo_dispensa/cadastrar", element: <CadastrarAtualizarMotivoDispensa />, gruposPermitidos: ["cre"], key: "cre-cadastrar-motivos-dispensa" },
      { path: "/motivo_dispensa/:id", element: <CadastrarAtualizarMotivoDispensa />, gruposPermitidos: ["cre"], key: "cre-atualizar-motivos-dispensa" },
      { path: "/disciplinas", element: <ListarDisciplinas />, gruposPermitidos: ["cre"], key: "cre-listar-disciplinas" },
      { path: "/disciplinas/cadastrar", element: <CadastrarAtualizarDisciplina />, gruposPermitidos: ["cre"], key: "cre-cadastrar-disciplinas" },
      { path: "/disciplinas/:codigo", element: <CadastrarAtualizarDisciplina />, gruposPermitidos: ["cre"], key: "cre-editar-disciplinas" },
      { path: "/turmas", element: <ListarTurmas />, gruposPermitidos: ["cre"], key: "cre-listar-turmas" },
      { path: "/turmas/cadastrar", element: <CadastrarAtualizarTurma />, gruposPermitidos: ["cre"], key: "cre-cadastrar-turmas" },
      { path: "/turmas/:id", element: <CadastrarAtualizarTurma />, gruposPermitidos: ["cre"], key: "cre-editar-turmas" },
      { path: "/cursos", element: <ListarCursos />, gruposPermitidos: ["cre"], key: "cre-listar-cursos" },
      { path: "/cursos/cadastrar", element: <CadastrarAtualizarCursos />, gruposPermitidos: ["cre"], key: "cre-cadastrar-cursos" },
      { path: "/cursos/:codigo", element: <CadastrarAtualizarCursos />, gruposPermitidos: ["cre"], key: "cre-editar-cursos" },
      { path: "/ppcs", element: <ListarPpc />, gruposPermitidos: ["cre"], key: "cre-listar-ppc" },
      { path: "/ppcs/cadastrar", element: <CadastrarAtualizarPpc />, gruposPermitidos: ["cre"], key: "cre-cadastrar-ppc" },
      { path: "/ppcs/:codigo", element: <CadastrarAtualizarPpc />, gruposPermitidos: ["cre"], key: "cre-editar-ppc" },
      { path: "/usuarios", element: <ListarUsuariosAtivos />, gruposPermitidos: ["cre"], key: "cre-listar-usuarios-ativos" },
      { path: "/usuarios/inativos", element: <ListarUsuariosInativos />, gruposPermitidos: ["cre"], key: "cre-listar-usuarios-inativos" },
      { path: "/usuarios/:id", element: <DetalhesUsuario />, gruposPermitidos: ["cre"], key: "cre-detalhes-usuario" },
      { path: "/usuarios/selecionargrupo", element: <SelecionarGrupoUsuario />, gruposPermitidos: ["cre"], key: "cre-selecionar-grupo-usuarios" },
      { path: "/usuarios/selecionargrupogestaosistema", element: <SelecionarGrupoGestaoSistema />, gruposPermitidos: ["cre"], key: "cre-selecionar-grupo-gestao-sistema" },
      { path: "/usuarios/cadastro", element: <CadastrarAtualizarUsuario />, gruposPermitidos: ["cre"], key: "cre-cadastrar-usuarios" },
      { path: "/usuarios/editar/:id", element: <CadastrarAtualizarUsuario />, gruposPermitidos: ["cre"], key: "cre-editar-usuarios" },
      { path: "/usuarios/cadastro/:grupo", element: <CadastrarAtualizarUsuarioGrupo />, gruposPermitidos: ["cre"], key: "cre-cadastrar-usuarios-grupo" },
      { path: "/usuarios/editar/:grupo/:id", element: <CadastrarAtualizarUsuarioGrupo />, gruposPermitidos: ["cre"], key: "cre-atualizar-usuarios-grupo" },
      { path: "/usuarios/editar/externo/:id", element: <CadastrarAtualizarUsuario />, gruposPermitidos: ["cre"], key: "cre-atualizar-usuarios-externo" },
      { path: "/usuarios/editar/responsavel/:id", element: <CadastrarAtualizarUsuario />, gruposPermitidos: ["cre"], key: "cre-atualizar-usuarios-responsavel" },
      { path: "/mandatos/cadastrar", element: <CadastrarAtualizarMandato />, gruposPermitidos: ["cre"], key: "cre-cadastrar-mandatos" },
      { path: "/mandatos/editar/:id", element: <CadastrarAtualizarMandato />, gruposPermitidos: ["cre"], key: "cre-editar-mandatos" },
      { path: "/mandatos", element: <HistoricoMandatos />, gruposPermitidos: ["cre"], key: "cre-listar-historico-mandatos" },
      { path: "/grupos", element: <ListarGrupos />, gruposPermitidos: ["cre"], key: "cre-listar-grupos" },
      { path: "/grupos/cadastrar", element: <CadastrarAtualizarGrupo />, gruposPermitidos: ["cre"], key: "cre-cadastrar-grupos" },
      { path: "/grupos/:id", element: <CadastrarAtualizarGrupo />, gruposPermitidos: ["cre"], key: "cre-editar-grupos" },
      { path: "/disponibilidades", element: <ListarDisponibilidades />, gruposPermitidos: ["cre"], key: "cre-disponibilidade-listar" },
      { path: "/disponibilidades/cadastrar", element: <CadastrarAtualizarDisponibilidade />, gruposPermitidos: ["cre"], key: "cre-disponibilidade-cadastrar" },
      { path: "/disponibilidades/:id", element: <CadastrarAtualizarDisponibilidade />, gruposPermitidos: ["cre"], key: "cre-disponibilidade-editar" },
      { path: "/solicitacoes", element: <Solicitacoes url="http://localhost:8000/solicitacoes/cre/listar-solicitacoes/" />, gruposPermitidos: ["cre"], key: "cre-listar-solicitacoes" },
      { path: "/cre/todas-solicitacoes", element: <TodasSolicitacoes />, gruposPermitidos: ["cre"], key: "cre-home" },
      { path: "/cre/detalhes-solicitacao/:id", element: <DetalheSolicitacaoCRE />, gruposPermitidos: ["cre"], key: "cre-detalhe-solicitacao" },
      { path: "/cre/solicitacoes-finalizadas", element: <SolicitacoesFinalizadas />, gruposPermitidos: ["cre"], key: "cre-solicitacoes-finalizadas" },
    ];
  }

  // Rotas do Coordenador
  if (grupo === "coordenador") {
    rotas = rotas.concat([
      { path: "/solicitacoes", element: <Solicitacoes url="http://localhost:8000/solicitacoes/coordenador/listar-solicitacoes/" />, gruposPermitidos: ["coordenador"], key: "coord-listar-solicitacoes" },
      { path: "/coordenador/solicitacoes", element: <HomeCoordenador />, gruposPermitidos: ["coordenador"], key: "coord-home" },
      { path: "/coordenador/detalhes-solicitacao/:id", element: <DetalhesSolicitacaoCoordenador />, gruposPermitidos: ["coordenador"], key: "coord-detalhes-solicitacao" },
    ]);
  }

  // Rotas do Aluno
  if (grupo === "aluno") {
    rotas = rotas.concat([
      { path: "/form_ativ_compl", element: <EntregaAtivCompl />, gruposPermitidos: ["aluno"], key: "aluno-form-ativ-compl" },
      { path: "/desistencia_vaga", element: <FormularioDesistenciaVaga />, gruposPermitidos: ["aluno"], key: "aluno-desistencia-vaga" },
      { path: "/abono_falta", element: <AbonoFalta />, gruposPermitidos: ["aluno"], key: "aluno-abono-falta" },
      { path: "/exercicio_domiciliar", element: <FormExercicioDomiciliar />, gruposPermitidos: ["aluno"], key: "aluno-exercicio-domiciliar" },
      { path: "/trancamento_matricula", element: <FormularioTrancamentoMatricula />, gruposPermitidos: ["aluno"], key: "aluno-trancamento-matricula" },
      { path: "/dispensa_ed_fisica", element: <DispensaEdFisica />, gruposPermitidos: ["aluno"], key: "aluno-dispensa-ed-fisica" },
      { path: "/trancamento_disciplina", element: <FormTrancDisciplina />, gruposPermitidos: ["aluno"], key: "aluno-trancamento-disciplina" },
      { path: "/formulario_trancamento_disciplina/disciplinas/:curso_codigo/", element: <Formulario />, gruposPermitidos: ["aluno"], key: "aluno-formulario-disciplina-curso" },
      { path: "/indisponivel", element: <FormularioIndisponivel />, gruposPermitidos: ["aluno"], key: "aluno-indisponivel" },
      { path: "/formularios/:tipoFormulario", element: <VerificadorDisponibilidade><FormularioTrancamentoMatricula /></VerificadorDisponibilidade>, gruposPermitidos: ["aluno"], key: "aluno-verificador-formulario" },
      { path: "/exercicios_domiciliares/gerenciar", element: <GerenciarExercDomicilares />, gruposPermitidos: ["aluno"], key: "aluno-gerenciar-exerc-domiciliares" },
      { path: "/solicitacoes", element: <Solicitacoes/>, gruposPermitidos: ["aluno"], key: "aluno-listar-solicitacoes" },
      { path: "/aluno/nova-solicitacao", element: <AlunoNovaSolicitacao />, gruposPermitidos: ["aluno"], key: "aluno-nova-solicitacao" },
      { path: "/detalhes-solicitacao/:id", element: <DetalhesSolicitacao />, gruposPermitidos: ["aluno"], key: "detalhes-solicitacao"}
    ]);
  }

  // Rotas do Responsável
  if (grupo === "responsavel") {
    rotas = rotas.concat([
      { path: "/desistencia_vaga", element: <FormularioDesistenciaVaga />, gruposPermitidos: ["responsavel"], key: "resp-desistencia-vaga" },
      { path: "/solicitacoes", element: <Solicitacoes url="http://localhost:8000/solicitacoes/minhas-solicitacoes/" />, gruposPermitidos: ["responsavel"], key: "resp-listar-solicitacoes" }
    ]);
  }

  // Rotas do Usuário Externo
  if (grupo === "externo") {
    rotas = rotas.concat([
      { path: "/externo/desistencia-vaga", element: <ExternoHome />, gruposPermitidos: ["externo"], key: "externo-home" },
      // Adicione outras rotas específicas para usuários externos, se houver
    ]);
  }

  // Rotas Comuns a Múltiplos Grupos Autenticados
  // Se Perfil é comum para CRE, Coordenador, Aluno, Responsável, Externo
  if (grupo) {
    rotas = rotas.concat([
      { path: "/perfil", element: <Perfil />, gruposPermitidos: ["cre", "coordenador", "aluno", "responsavel", "externo"], key: "perfil-comum" },
      // Adicione outras rotas comuns aqui, se aplicável
    ]);
  }

  return rotas;
}

/*

  //Solicitacoes
  <Route path="/todas-solicitacoes" element={<ListarSolicitacoes />} key="solicitacao-list-create" />,

  //TELAS USERS

  //Tela CRE
  <Route path="/cre/todas-solicitacoes" element={<TodasSolicitacoes />} key="home_cre" />,
  <Route path="/cre/detalhes-solicitacao/:id" element={<DetalheSolicitacao />} key="detalhe_solicitacao" />,
  <Route path="/cre/solicitacoes-finalizadas" element={<SolicitacoesFinalizadas />} key="solicitacoes_finalizadas" />,

  //Tela Coordenador
  <Route path="/coordenador/solicitacoes" element={<HomeCoordenador />} key="home_coordenador" />,

  //Tela Externo
  <Route path="/externo/desistencia-vaga" element={<ExternoHome />} key="home_externo" />,

  //Tela Aluno
  <Route path="/aluno/nova-solicitacao" element={<AlunoNovaSolicitacao />} key="nova-solicitacao-aluno" />,
  <Route path="/aluno/minhas-solicitacoes" element={<MinhasSolicitacoesAluno />} key="minhas-solicitacoes-aluno" />,
  <Route path="/aluno/detalhes-solicitacao/:id" element={<DetalhesSolicitacao />} key="detalhes-solicitacao-aluno" />,

  //Tela gerenciamento Exerciícios Domiciliares
  

  <Route path="/coordenador/detalhes-solicitacao/:id" element={<DetalhesSolicitacaoCoordenador />} key="detalhes-solicitacao-coordenador" />,

  <Route path="/solicitacoes" element={grupo == "coordenador" ? <Solicitacoes url="http://localhost:8000/solicitacoes/coordenador/listar-solicitacoes/" />
    : grupo == "aluno/responsavel" ? <Solicitacoes url="http://localhost:8000/solicitacoes/minhas-solicitacoes/" />
      : grupo == "cre" ? <Solicitacoes url="http://localhost:8000/solicitacoes/cre/listar-solicitacoes" /> : NaN
  } key={"solicitacoes"} />
];*/

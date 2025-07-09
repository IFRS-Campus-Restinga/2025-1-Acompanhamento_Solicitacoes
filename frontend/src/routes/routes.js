// Este arquivo define as configurações de rotas para cada grupo de usuário.
// Ele retorna um array de objetos de rota, não componentes <Route> diretamente.

//Formulários com wrappers de permissão
import FormularioAbonoFaltaWrapper from "../pages/forms/abono_falta/formulario_abono_falta_wrapper.js";
import FormularioDesistenciaVaga from "../pages/forms/desistencia_vaga/formulario_desistencia_vaga.js";
import FormularioDispensaEdFisicaWrapper from "../pages/forms/dispensa_ed_fisica/formulario_dispensa_ed_fisica_wrapper.js";
import FormularioAtivComplWrapper from "../pages/forms/entrega_ativ_compl/formulario_ativ_compl_wrapper.js";
import FormularioExercDomWrapper from '../pages/forms/exercicios_domiciliares/formulario_exerc_dom_wrapper.js';
import FormularioTrancDisciplinaWrapper from "../pages/forms/trancamento_disciplina/formulario_tranc_disc_wrapper.js";
import FormularioTrancamentoMatriculaWrapper from "../pages/forms/trancamento_matricula/formulario_trancamento_matricula_wrapper.js";

// Formulário original para disciplinas por curso (sem wrapper pois é específico)
import { default as Formulario } from "../pages/forms/trancamento_disciplina/formulario_tranc_disc.js";

// Páginas Comuns/Gerais
import Perfil from "../pages/perfil/editar_perfil.js";
import ListarSolicitacoes from "../listar_solicitacoes.js"; // Verifique se esta é usada, ou se é substituída por Solicitacoes
import Home from "./../pages/home"; // Geralmente, a Home não é uma rota protegida por grupo
import GestaoSistema from "../pages/telas_users/telas_cre/gestao_sistema";
//import PosLogin from "../pages/pos_login";

//import Cruds from "../pages/configuracoes/cruds.js";
import ListarSolicitacoes from "../listar_solicitacoes.js";

import Home from "./../pages/home";

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

// Importe o GoogleRedirectHandler
import GoogleRedirectHandler from "../components/GoogleRedirectHandler.js";

//Tela CRE
import DetalheSolicitacao from "../pages/telas_users/telas_cre/detalhe_solicitacao.js";
import HomeCRE from "../pages/telas_users/telas_cre/home_cre.js";
import SolicitacoesFinalizadas from "../pages/telas_users/telas_cre/solicitacoes_finalizadas.js";

// import DetalhesSolicitacaoCoordenador from "../pages/telas_users/tela_coordenador/detalhe_solicitacao.js"; // Coordenador
// import HomeCoordenador from "../pages/telas_users/tela_coordenador/homecoordenador.js";

import AlunoNovaSolicitacao from "../pages/telas_users/telas_aluno/aluno_nova_solicitacao";

import ExternoNovaSolicitacao from "../pages/telas_users/tela_externo/externo_nova_solicitacao.js";

// Gerenciamento de Exercícios Domiciliares
import GerenciarExercDomicilares from "../pages/exerc_domiciliares/gerenciar.js";

// Componentes de permissão
import { RolePermissionWrapper, CRERoute, AlunoRoute, ManagementRoute } from "../components/PermissionWrapper";

export default function RotasPorGrupo(grupo) {
  if (!grupo) {
    // Se o grupo não for definido, retorna um array vazio.
    // A lógica de redirecionamento para não-autenticados está no App.js
    return [];
  }

  let rotas = [];

  // Gestão do sistema - apenas CRE
  <Route 
    path="/cre/gestao-sistema" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <GestaoSistema />
      </RolePermissionWrapper>
    } 
    key="configuracoes" 
  />,

  <Route path="/perfil" element={<Perfil />} key="perfil" />,

  // Motivo Abono - apenas CRE e Coordenador podem gerenciar
  <Route 
    path="/motivo_abono" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <ListarMotivosAbono />
      </RolePermissionWrapper>
    } 
    key="listar-abono" 
  />,
  <Route 
    path="/motivo_abono/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <CadastrarAtualizarAbono />
      </RolePermissionWrapper>
    } 
    key="cadastrar-abono" 
  />,
  <Route 
    path="/motivo_abono/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <CadastrarAtualizarAbono />
      </RolePermissionWrapper>
    } 
    key="editar-abono" 
  />,

  // Motivo Exercícios - apenas CRE e Coordenador podem gerenciar
  <Route 
    path="/motivo_exercicios" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <ListarMotivosExercicios />
      </RolePermissionWrapper>
    } 
    key="listar-exercicios" 
  />,
  <Route 
    path="/motivo_exercicios/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <CadastrarAtualizarExercicios />
      </RolePermissionWrapper>
    } 
    key="cadastrar-exercicios" 
  />,
  <Route 
    path="/motivo_exercicios/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <CadastrarAtualizarExercicios />
      </RolePermissionWrapper>
    } 
    key="editar-exercicios" 
  />,

  // Motivo Dispensa de Educação Física - apenas CRE e Coordenador podem gerenciar
  <Route 
    path="/motivo_dispensa" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <ListaMotivosDispensa />
      </RolePermissionWrapper>
    } 
    key="listar-dispensa" 
  />,
  <Route 
    path="/motivo_dispensa/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <CadastrarAtualizarMotivoDispensa />
      </RolePermissionWrapper>
    } 
    key="cadastrar-motivos-dispensa" 
  />,
  <Route 
    path="/motivo_dispensa/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <CadastrarAtualizarMotivoDispensa />
      </RolePermissionWrapper>
    } 
    key="atualizar-motivos-dispensa" 
  />,

  // Disciplinas - apenas CRE pode gerenciar
  <Route 
    path="/disciplinas" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarDisciplinas />
      </RolePermissionWrapper>
    } 
    key="listar-disciplinas" 
  />,
  <Route 
    path="/disciplinas/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarDisciplina />
      </RolePermissionWrapper>
    } 
    key="cadastrar-disciplinas" 
  />,
  <Route 
    path="/disciplinas/:codigo" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarDisciplina />
      </RolePermissionWrapper>
    } 
    key="editar-disciplinas" 
  />,

  // Turmas - apenas CRE pode gerenciar
  <Route 
    path="/turmas" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarTurmas />
      </RolePermissionWrapper>
    } 
    key="listar-turmas" 
  />,
  <Route 
    path="/turmas/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarTurma />
      </RolePermissionWrapper>
    } 
    key="cadastrar-turmas" 
  />,
  <Route 
    path="/turmas/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarTurma />
      </RolePermissionWrapper>
    } 
    key="editar-turmas" 
  />,

  // Cursos - apenas CRE pode gerenciar
  <Route 
    path="/cursos" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarCursos />
      </RolePermissionWrapper>
    } 
    key="listar-cursos" 
  />,
  <Route 
    path="/cursos/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarCursos />
      </RolePermissionWrapper>
    } 
    key="cadastrar-cursos" 
  />,
  <Route 
    path="/cursos/:codigo" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarCursos />
      </RolePermissionWrapper>
    } 
    key="editar-cursos" 
  />,

  // PPC - apenas CRE pode gerenciar
  <Route 
    path="/ppcs" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarPpc />
      </RolePermissionWrapper>
    } 
    key="listar-ppc" 
  />,
  <Route 
    path="/ppcs/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarPpc />
      </RolePermissionWrapper>
    } 
    key="cadastrar-ppc" 
  />,
  <Route 
    path="/ppcs/:codigo" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarPpc />
      </RolePermissionWrapper>
    } 
    key="editar-ppc" 
  />,

  // Usuarios - apenas CRE pode gerenciar
  <Route 
    path="/usuarios" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarUsuariosAtivos />
      </RolePermissionWrapper>
    } 
    key="listar-usuarios-ativos" 
  />,
  <Route 
    path="/usuarios/inativos" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarUsuariosInativos />
      </RolePermissionWrapper>
    } 
    key="listar-usuarios-inativos" 
  />,
  <Route 
    path="/usuarios/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <DetalhesUsuario />
      </RolePermissionWrapper>
    } 
    key="detalhes-usuario" 
  />,
  <Route 
    path="/usuarios/selecionargrupo" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <SelecionarGrupoUsuario />
      </RolePermissionWrapper>
    } 
    key="selecionar-grupo-usuarios" 
  />,
  <Route 
    path="/usuarios/selecionargrupogestaosistema" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <SelecionarGrupoGestaoSistema />
      </RolePermissionWrapper>
    } 
    key="selecionar-grupo-usuarios-gestao" 
  />,
  <Route 
    path="/usuarios/cadastro" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarUsuario />
      </RolePermissionWrapper>
    } 
    key="cadastrar-usuarios" 
  />,
  <Route 
    path="/usuarios/editar/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarUsuario />
      </RolePermissionWrapper>
    } 
    key="editar-usuarios" 
  />,
  <Route 
    path="/usuarios/cadastro/:grupo" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarUsuarioGrupo />
      </RolePermissionWrapper>
    } 
    key="cadastrar-usuarios-grupo" 
  />,
  <Route 
    path="/usuarios/editar/:grupo/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarUsuarioGrupo />
      </RolePermissionWrapper>
    } 
    key="atualizar-usuarios-grupo" 
  />,
  <Route 
    path="/usuarios/editar/externo/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarUsuario />
      </RolePermissionWrapper>
    } 
    key="atualizar-usuarios-externo" 
  />,
  <Route 
    path="/usuarios/editar/responsavel/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarUsuario />
      </RolePermissionWrapper>
    } 
    key="atualizar-usuarios-responsavel" 
  />,
  
  //Mandatos - apenas CRE pode gerenciar
  <Route 
    path="/mandatos/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarMandato />
      </RolePermissionWrapper>
    } 
    key="cadastrar-mandatos" 
  />,
  <Route 
    path="/mandatos/editar/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarMandato />
      </RolePermissionWrapper>
    } 
    key="editar-mandatos" 
  />,
  <Route 
    path="/mandatos" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <HistoricoMandatos/>
      </RolePermissionWrapper>
    } 
    key="listar-historico-mandatos" 
  />,

  // Grupos - apenas CRE pode gerenciar
  <Route 
    path="/grupos" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarGrupos />
      </RolePermissionWrapper>
    } 
    key="listar-grupos" 
  />,
  <Route 
    path="/grupos/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarGrupo />
      </RolePermissionWrapper>
    } 
    key="cadastrar-grupos" 
  />,
  <Route 
    path="/grupos/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarGrupo />
      </RolePermissionWrapper>
    } 
    key="editar-grupos" 
  />,

  //Forms - COM CONTROLE DE PERMISSÕES
  <Route path="/form_ativ_compl" element={<FormularioAtivComplWrapper />} key="form_ativ_compl" />,
  <Route path="/desistencia_vaga" element={<FormularioDesistenciaVaga />} key="desistencia_vaga" />,
  <Route path="/abono_falta" element={<FormularioAbonoFaltaWrapper />} key="abono_falta" />,
  <Route path="/exercicio_domiciliar" element={<FormularioExercDomWrapper />} key="exercicio_domiciliar" />,
  <Route path="/trancamento_matricula" element={<FormularioTrancamentoMatriculaWrapper />} key="trancamento_matricula" />,
  <Route path="/dispensa_ed_fisica" element={<FormularioDispensaEdFisicaWrapper />} key="dispensa_ed_fisica" /> ,
  <Route path="/trancamento_disciplina" element={<FormularioTrancDisciplinaWrapper />} key="trancamento_disciplina" />,
  <Route path="/formulario_trancamento_disciplina/disciplinas/:curso_codigo/" element={<Formulario />}  key="formulario-disciplina-curso"/>,

  // Disponibilidades - apenas CRE pode gerenciar
  <Route 
    path="/disponibilidades" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarDisponibilidades />
      </RolePermissionWrapper>
    } 
    key="disponibilidade-listar" 
  />,
  <Route 
    path="/disponibilidades/cadastrar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarDisponibilidade />
      </RolePermissionWrapper>
    } 
    key="disponibilidade-cadastrar" 
  />,
  <Route 
    path="/disponibilidades/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <CadastrarAtualizarDisponibilidade />
      </RolePermissionWrapper>
    } 
    key="disponibilidade-editar" 
  />,
  <Route path="/indisponivel" element={<FormularioIndisponivel />} key="indisponivel" />,
  <Route 
    path="formularios/:tipoFormulario"
    element={
      <VerificadorDisponibilidade>
        <FormularioTrancamentoMatriculaWrapper />
      </VerificadorDisponibilidade>
    }
    key="verificador-formulario"
  />,

  //Solicitacoes - apenas CRE pode ver todas
  <Route 
    path="/todas-solicitacoes" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <ListarSolicitacoes />
      </RolePermissionWrapper>
    } 
    key="solicitacao-list-create"
  />,

  //TELAS USERS

  //Tela CRE
  <Route 
    path="/cre/home" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <HomeCRE />
      </RolePermissionWrapper>
    } 
    key="home_cre" 
  />,
  <Route 
    path="/detalhe-solicitacao/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['cre', 'coordenador']} showMessage={true}>
        <DetalheSolicitacao />
      </RolePermissionWrapper>
    } 
    key="detalhe_solicitacao" 
  />,
  <Route 
    path="/solicitacoes-finalizadas" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <SolicitacoesFinalizadas />
      </RolePermissionWrapper>
    } 
    key="solicitacoes_finalizadas" 
  />,

  //Tela Coordenador
  <Route 
    path="/coordenador/coordenador_home" 
    element={
      <RolePermissionWrapper allowedRoles={['coordenador']} showMessage={true}>
        <HomeCoordenador />
      </RolePermissionWrapper>
    } 
    key="home_coordenador" 
  />,

  //Tela Externo
  <Route 
    path="/externo/desistencia-vaga" 
    element={
      <RolePermissionWrapper allowedRoles={['externo']} showMessage={true}>
        <ExternoHome />
      </RolePermissionWrapper>
    } 
    key="home_externo" 
  />,

  //Tela Aluno
  <Route 
    path="/aluno/nova-solicitacao" 
    element={
      <RolePermissionWrapper allowedRoles={['aluno', 'responsavel']} showMessage={true}>
        <AlunoNovaSolicitacao/>
      </RolePermissionWrapper>
    } 
    key="nova-solicitacao-aluno"
  />,
  <Route 
    path="/aluno/minhas-solicitacoes" 
    element={
      <RolePermissionWrapper allowedRoles={['aluno', 'responsavel', 'externo']} showMessage={true}>
        <MinhasSolicitacoesAluno />
      </RolePermissionWrapper>
    } 
    key="minhas-solicitacoes-aluno" 
  />,
  <Route 
    path="/aluno/detalhes-solicitacao/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['aluno', 'responsavel', 'externo']} showMessage={true}>
        <DetalhesSolicitacao />
      </RolePermissionWrapper>
    } 
    key="detalhes-solicitacao-aluno" 
  />,

  //Tela gerenciamento Exerciícios Domiciliares - apenas CRE
  <Route 
    path="/exercicios_domiciliares/gerenciar" 
    element={
      <RolePermissionWrapper allowedRoles={['cre']} showMessage={true}>
        <GerenciarExercDomicilares />
      </RolePermissionWrapper>
    } 
    key="gerenciar_exerc_domiciliares" 
  />,

  <Route 
    path="/coordenador/detalhes-solicitacao/:id" 
    element={
      <RolePermissionWrapper allowedRoles={['coordenador']} showMessage={true}>
        <DetalhesSolicitacaoCoordenador />
      </RolePermissionWrapper>
    } 
    key="detalhes-solicitacao-coordenador" 
  />
}

/*export default routes;

  <Route path="/solicitacoes" element={grupo == "coordenador" ? <Solicitacoes url="http://localhost:8000/solicitacoes/coordenador/listar-solicitacoes/" />
    : grupo == "aluno/responsavel" ? <Solicitacoes url="http://localhost:8000/solicitacoes/minhas-solicitacoes/" />
      : grupo == "cre" ? <Solicitacoes url="http://localhost:8000/solicitacoes/cre/listar-solicitacoes" /> : NaN
  } key={"solicitacoes"} />
];*/

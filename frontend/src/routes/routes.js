// Este arquivo define as configurações de rotas para cada grupo de usuário.
// Ele retorna um array de objetos de rota, não componentes <Route> diretamente.
import { Route, Routes } from 'react-router-dom';

import FormularioDesistenciaVaga from "../pages/forms/desistencia_vaga/formulario_desistencia_vaga.js";
import MinhasSolicitacoesAluno from '../pages/telas_users/telas_aluno/aluno_minhas_solicitacoes.js';

// Formulário original para disciplinas por curso (sem wrapper pois é específico)
import FormularioTrancamentoDisciplina, { default as Formulario } from "../pages/forms/trancamento_disciplina/formulario_tranc_disc.js";

// Páginas Comuns/Gerais
import Perfil from "../pages/perfil/editar_perfil.js";
//import ListarSolicitacoes from "../pages//listar_solicitacoes.js"; // Verifique se esta é usada, ou se é substituída por Solicitacoes
import Home from "./../pages/home"; // Geralmente, a Home não é uma rota protegida por grupo
//import GestaoSistema from "../pages/telas_users/telas_cre/gestao_sistema";
//import PosLogin from "../pages/pos_login";

//import Cruds from "../pages/configuracoes/cruds.js";
//import ListarSolicitacoes from "../listar_solicitacoes.js";

//import Home from "./../pages/home";

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
//import DetalheSolicitacao from "../pages/telas_users/telas_cre/detalhe_solicitacao.js";
import HomeCRE from "../pages/telas_users/telas_cre/home_cre.js";
import SolicitacoesFinalizadas from "../pages/telas_users/telas_cre/solicitacoes_finalizadas.js";

import DetalhesSolicitacaoCoordenador from "../pages/telas_users/tela_coordenador/detalhe_solicitacao.js"; // Coordenador
//import HomeCoordenador from "../pages/telas_users/tela_coordenador/HomeCoordenador.js";

import AlunoNovaSolicitacao from "../pages/telas_users/telas_aluno/aluno_nova_solicitacao";

import ExternoNovaSolicitacao from "../pages/telas_users/tela_externo/externo_nova_solicitacao.js";

// Gerenciamento de Exercícios Domiciliares
import GerenciarExercDomicilares from "../pages/exerc_domiciliares/gerenciar.js";

// Componentes de permissão
import { RolePermissionWrapper, CRERoute, AlunoRoute, ManagementRoute } from "../components/PermissionWrapper";
import ConfiguracoesCRE from '../pages/telas_users/telas_cre/configuracoes.js';
import FormularioAbonoFaltas from '../pages/forms/abono_falta/formulario_abono_falta.js';
import FormularioExercicioDomiciliar from '../pages/forms/exercicios_domiciliares/formulario_exerc_dom.js';
import FormularioTrancamentoMatricula from '../pages/forms/trancamento_matricula/formulario_trancamento_matricula.js';
import FormularioDispensaEdFisica from '../pages/forms/dispensa_ed_fisica/formulario_dispensa_ed_fisica.js';
import FormularioAtividadesComplementares from '../pages/forms/entrega_ativ_compl/formulario_ativ_compl.js';
import DetalheSolicitacaoCRE from '../pages/telas_users/telas_cre/detalhe_solicitacao.js';
import DetalhesSolicitacao from '../pages/telas_users/telas_aluno/aluno_detalhes_solicitacao.js';

export default function RotasPorGrupo(grupo) {
  if (!grupo) {
    // Se o grupo não for definido, retorna um array vazio.
    // A lógica de redirecionamento para não-autenticados está no App.js
    return [];
  }

  let rotas = [// Gestão do sistema - apenas CRE
  <Route
    path="/cre/configuracoes"
    element={<ConfiguracoesCRE/>} // Apenas o componente
    gruposPermitidos={['cre']} // Nova propriedade com os grupos permitidos
    key="configuracoes"
  />,

  <Route path="/perfil" element={<Perfil />} gruposPermitidos={['cre','aluno','coordenador','externo','responsavel']}  key="perfil" />,

  // Motivo Abono - apenas CRE e Coordenador podem gerenciar
  <Route 
    path="/motivo_abono" 
    element={<ListarMotivosAbono/>}
    gruposPermitidos={['cre']}
    key="listar-abono" 
  />,
  <Route 
    path="/motivo_abono/cadastrar" 
    element={<CadastrarAtualizarAbono/>}
    gruposPermitidos={['cre']}
    key="cadastrar-abono" 
  />,
  <Route 
    path="/motivo_abono/:id" 
    element={<CadastrarAtualizarAbono/>}
    gruposPermitidos={['cre']}
    key="editar-abono" 
  />,

  // Motivo Exercícios - apenas CRE e Coordenador podem gerenciar
  <Route 
    path="/motivo_exercicios" 
    element={<ListarMotivosExercicios/>}
    gruposPermitidos={['cre']}
    key="listar-exercicios" 
  />,
  <Route 
    path="/motivo_exercicios/cadastrar" 
    element={<CadastrarAtualizarExercicios/>}
    gruposPermitidos={['cre']}
    key="cadastrar-exercicios" 
  />,
  <Route 
    path="/motivo_exercicios/:id" 
    element={<CadastrarAtualizarExercicios/>}
    gruposPermitidos={['cre']}
    key="editar-exercicios" 
  />,

  // Motivo Dispensa de Educação Física - apenas CRE e Coordenador podem gerenciar
  <Route 
    path="/motivo_dispensa" 
    element={<ListaMotivosDispensa/>}
    gruposPermitidos={['cre']}
    key="listar-dispensa" 
  />,
  <Route 
    path="/motivo_dispensa/cadastrar" 
    element={<CadastrarAtualizarMotivoDispensa/>}
    gruposPermitidos={['cre']}
    key="cadastrar-motivos-dispensa" 
  />,
  <Route 
    path="/motivo_dispensa/:id" 
    element={<CadastrarAtualizarMotivoDispensa/>}
    gruposPermitidos={['cre']}
    key="atualizar-motivos-dispensa" 
  />,

  // Disciplinas - apenas CRE pode gerenciar
  <Route 
    path="/disciplinas" 
    element={<ListarDisciplinas/>}
    gruposPermitidos={['cre']}
    key="listar-disciplinas" 
  />,
  <Route 
    path="/disciplinas/cadastrar" 
    element={<CadastrarAtualizarDisciplina/>}
    gruposPermitidos={['cre']}
    key="cadastrar-disciplinas" 
  />,
  <Route 
    path="/disciplinas/:codigo" 
    element={<CadastrarAtualizarDisciplina/>}
    gruposPermitidos={['cre']}
    key="editar-disciplinas" 
  />,

  // Turmas - apenas CRE pode gerenciar
  <Route 
    path="/turmas" 
    element={<ListarTurmas/>}
    gruposPermitidos={['cre']}
    key="listar-turmas" 
  />,
  <Route 
    path="/turmas/cadastrar" 
    element={<CadastrarAtualizarTurma/>}
    gruposPermitidos={['cre']}
    key="cadastrar-turmas" 
  />,
  <Route 
    path="/turmas/:id" 
    element={<CadastrarAtualizarTurma/>}
    gruposPermitidos={['cre']}
    key="editar-turmas" 
  />,

  // Cursos - apenas CRE pode gerenciar
  <Route 
    path="/cursos" 
    element={<ListarCursos/>}
    gruposPermitidos={['cre']}
    key="listar-cursos" 
  />,
  <Route 
    path="/cursos/cadastrar" 
    element={<CadastrarAtualizarCursos/>}
    gruposPermitidos={['cre']}
    key="cadastrar-cursos" 
  />,
  <Route 
    path="/cursos/:codigo" 
    element={<CadastrarAtualizarCursos/>}
    gruposPermitidos={['cre']}
    key="editar-cursos" 
  />,

  // PPC - apenas CRE pode gerenciar
  <Route 
    path="/ppcs" 
    element={<ListarPpc/>}
    gruposPermitidos={['cre']}
    key="listar-ppc" 
  />,
  <Route 
    path="/ppcs/cadastrar" 
    element={<CadastrarAtualizarPpc/>}
    gruposPermitidos={['cre']}
    key="cadastrar-ppc" 
  />,
  <Route 
    path="/ppcs/:codigo" 
    element={<CadastrarAtualizarPpc/>}
    gruposPermitidos={['cre']}
    key="editar-ppc" 
  />,

  // Usuarios - apenas CRE pode gerenciar
  <Route 
    path="/usuarios" 
    element={<ListarUsuariosAtivos/>}
    gruposPermitidos={['cre']}
    key="listar-usuarios-ativos" 
  />,
  <Route 
    path="/usuarios/inativos" 
    element={<ListarUsuariosInativos/>}
    gruposPermitidos={['cre']}
    key="listar-usuarios-inativos" 
  />,
  <Route 
    path="/usuarios/:id" 
    element={<DetalhesUsuario/>}
    gruposPermitidos={['cre']}
    key="detalhes-usuario" 
  />,
  <Route 
    path="/usuarios/selecionargrupo" 
    element={<CadastrarAtualizarUsuario/>} 
    gruposPermitidos={['aluno','externo', 'responsavel', 'cre', 'coordenador']}
    key="selecionar-grupo-usuarios" 
  />,
  <Route 
    path="/usuarios/selecionargrupogestaosistema" 
    element={<CadastrarAtualizarUsuarioGrupo/>}
    gruposPermitidos={['cre']}
    key="selecionar-grupo-usuarios-gestao" 
  />,
  <Route 
    path="/usuarios/cadastro" 
    element={<CadastrarAtualizarUsuario/>}
    gruposPermitidos={['aluno','externo', 'responsavel', 'cre', 'coordenador']}
    key="cadastrar-usuarios" 
  />,
  <Route 
    path="/usuarios/editar/:id" 
    element={<CadastrarAtualizarUsuario/>}
    gruposPermitidos={['aluno','externo', 'responsavel', 'cre', 'coordenador']}
    key="editar-usuarios" 
  />,
  <Route 
    path="/usuarios/cadastro/:grupo" 
    element={<CadastrarAtualizarGrupo/>}
    gruposPermitidos={['cre']}
    key="cadastrar-usuarios-grupo" 
  />,
  <Route 
    path="/usuarios/editar/:grupo/:id" 
    element={<CadastrarAtualizarGrupo/>}
    gruposPermitidos={['cre']}
    key="atualizar-usuarios-grupo" 
  />,
  <Route 
    path="/usuarios/editar/externo/:id" 
    element={<CadastrarAtualizarUsuario/>}
    gruposPermitidos={['cre']}
    key="atualizar-usuarios-externo" 
  />,
  <Route 
    path="/usuarios/editar/responsavel/:id" 
    element={<CadastrarAtualizarUsuario/>}
    gruposPermitidos={['cre']}
    key="atualizar-usuarios-responsavel" 
  />,
  
  //Mandatos - apenas CRE pode gerenciar
  <Route 
    path="/mandatos/cadastrar" 
    element={<CadastrarAtualizarMandato/>}
    gruposPermitidos={['cre']}
    key="cadastrar-mandatos" 
  />,
  <Route 
    path="/mandatos/editar/:id" 
    element={<CadastrarAtualizarMandato/>}
    gruposPermitidos={['cre']}
    key="editar-mandatos" 
  />,
  <Route 
    path="/mandatos" 
    element={<HistoricoMandatos/>}
    gruposPermitidos={['cre']}
    key="listar-historico-mandatos" 
  />,

  // Grupos - apenas CRE pode gerenciar
  <Route 
    path="/grupos" 
    element={<ListarGrupos/>}
    gruposPermitidos={['cre']}
    key="listar-grupos" 
  />,
  <Route 
    path="/grupos/cadastrar" 
    element={<CadastrarAtualizarGrupo/>}
    gruposPermitidos={['cre']}
    key="cadastrar-grupos" 
  />,
  <Route 
    path="/grupos/:id" 
    element={<CadastrarAtualizarGrupo/>}
    gruposPermitidos={['cre']}
    key="editar-grupos" 
  />,

  //Forms - COM CONTROLE DE PERMISSÕES
  <Route path="/form_ativ_compl" element={<FormularioAtividadesComplementares />} gruposPermitidos={['aluno','responsavel']} key="form_ativ_compl" />,
  <Route path="/desistencia_vaga" element={<FormularioDesistenciaVaga />} gruposPermitidos={['aluno','externo','responsavel']} key="desistencia_vaga" />,
  <Route path="/abono_falta" element={<FormularioAbonoFaltas />} gruposPermitidos={['aluno','responsavel']}key="abono_falta" />,
  <Route path="/exercicio_domiciliar" element={<FormularioExercicioDomiciliar />} gruposPermitidos={['aluno','responsavel']}key="exercicio_domiciliar" />,
  <Route path="/trancamento_matricula" element={<FormularioTrancamentoMatricula />} gruposPermitidos={['aluno','responsavel']}key="trancamento_matricula" />,
  <Route path="/dispensa_ed_fisica" element={<FormularioDispensaEdFisica />} gruposPermitidos={['aluno','responsavel']}key="dispensa_ed_fisica" /> ,
  <Route path="/trancamento_disciplina" element={<FormularioTrancamentoDisciplina />} gruposPermitidos={['aluno','responsavel']}key="trancamento_disciplina" />,
  <Route path="/formulario_trancamento_disciplina/disciplinas/:curso_codigo/" element={<Formulario/>} gruposPermitidos={['aluno','responsavel']} key="formulario-disciplina-curso"/>,

  // Disponibilidades - apenas CRE pode gerenciar
  <Route 
    path="/disponibilidades" 
    element={<CadastrarAtualizarDisponibilidade/>}
    gruposPermitidos={['cre']}
    key="disponibilidade-listar" 
  />,
  <Route 
    path="/disponibilidades/cadastrar" 
    element={<CadastrarAtualizarDisponibilidade/>}
    gruposPermitidos={['cre']}
    key="disponibilidade-cadastrar" 
  />,
  <Route 
    path="/disponibilidades/:id" 
    element={<CadastrarAtualizarDisponibilidade/>}
    gruposPermitidos={['cre']} 
    key="disponibilidade-editar" 
  />,
  <Route 
    path="/indisponivel" 
    element={<FormularioIndisponivel />}
    gruposPermitidos={['cre','aluno','externo','coordenador','responsavel']} 
    key="indisponivel" 
  />,
  <Route 
    path="formularios/:tipoFormulario"
    element={<VerificadorDisponibilidade/>}
    gruposPermitidos={['cre']}
    key="verificador-formulario"
  />,

  //Solicitacoes - apenas CRE pode ver todas
  <Route 
    path="/todas-solicitacoes" 
    element={<DetalheSolicitacaoCRE/>}
    gruposPermitidos={['cre']}
    key="solicitacao-list-create"
  />,

  //TELAS USERS

  //Tela CRE
  <Route 
    path="/cre/home" 
    element={<HomeCRE/>}
    gruposPermitidos={['cre']}
    key="home_cre" 
  />,
  <Route 
    path="/detalhe-solicitacao/:id" 
    element={<DetalheSolicitacaoCRE/>}
    gruposPermitidos={['cre','coordenador']}
    key="detalhe_solicitacao" 
  />,
  <Route 
    path="/solicitacoes-finalizadas" 
    element={<SolicitacoesFinalizadas/>}
    gruposPermitidos={['cre','coordenador']}
    key="solicitacoes_finalizadas" 
  />,

  //Tela Coordenador
  // <Route 
  //   path="/coordenador/coordenador_home" 
  //   element={
  //     <RolePermissionWrapper allowedRoles={['coordenador']} showMessage={true}>
  //       <HomeCoordenador />
  //     </RolePermissionWrapper>
  //   } 
  //   key="home_coordenador" 
  // />,

  //Tela Externo
  <Route 
    path="/externo/desistencia-vaga" 
    element={<ExternoNovaSolicitacao/>}
    gruposPermitidos={['externo']}
    key="home_externo" 
  />,

  //Tela Aluno
  <Route 
    path="/aluno/nova-solicitacao" 
    element={<AlunoNovaSolicitacao/>}
    gruposPermitidos={['aluno','externo','responsavel']}
    key="nova-solicitacao-aluno"
  />,
  <Route 
    path="/aluno/minhas-solicitacoes" 
    element={<MinhasSolicitacoesAluno/>}
    gruposPermitidos={['aluno']}
    key="minhas-solicitacoes-aluno" 
  />,
  <Route 
    path="/aluno/detalhes-solicitacao/:id" 
    element={<DetalhesSolicitacao/>}
    gruposPermitidos={['aluno']}
    key="detalhes-solicitacao-aluno" 
  />,

  //Tela gerenciamento Exerciícios Domiciliares - apenas CRE
  <Route 
    path="/exercicios_domiciliares/gerenciar" 
    element={<GerenciarExercDomicilares/>}
    gruposPermitidos={['cre']}
    key="gerenciar_exerc_domiciliares" 
  />,

  <Route 
    path="/coordenador/detalhes-solicitacao/:id" 
    element={<DetalhesSolicitacaoCoordenador/>}
    gruposPermitidos={['coordenador']}
    key="detalhes-solicitacao-coordenador" 
  />
];

   return rotas;
}

/*export default routes;

  <Route path="/solicitacoes" element={grupo == "coordenador" ? <Solicitacoes url="http://localhost:8000/solicitacoes/coordenador/listar-solicitacoes/" />
    : grupo == "aluno/responsavel" ? <Solicitacoes url="http://localhost:8000/solicitacoes/minhas-solicitacoes/" />
      : grupo == "cre" ? <Solicitacoes url="http://localhost:8000/solicitacoes/cre/listar-solicitacoes" /> : NaN
  } key={"solicitacoes"} />
];*/

from django.urls import path, include

from .views.estaticas import api_root, saudacao
from .views.curso_view import *
from .views.ppc_view import *
from .views.motivo_abono_view import *
from .views.motivo_dispensa_view import *
from .views.motivo_exercicios_view import *
from .views.coordenador_view import CoordenadorListCreateView, CoordenadorRetrieveUpdateDestroyView
from .views.cre_view import CREListCreateView, CRERetrieveUpdateDestroyView
from .views.aluno_view import *
from .views.disciplina_view import *
from .views.tipo_falta_view import *
from .views.grupo_view import *
from solicitacoes_app.views.turma_view import *
from .views.usuario_view import UsuarioListCreateView, UsuarioRetrieveUpdateDestroyView, UsuariosInativosView, AlunoEmailListView, UsuarioReativarView, UsuarioAprovarCadastroView
from .views.responsavel_view import *
from .views.form_tranc_matricula_view import *
from .views.form_disp_ed_fisica_view import *
from .views.anexo_view import *
from .views.form_abono_falta_view import *
from .views.mandato_view import MandatoOrdenadoListView, MandatoListCreateView, MandatoRetrieveUpdateDestroyView
from .views.form_tranc_disciplina_view import FormTrancDisciplinaListCreate, FormTrancDisciplinaDetail, disciplinas_por_curso

from .views.form_desistencia_vaga_view import *
from .views.nome_view import *
from .views.perfil_usuario_view import *
from .views.form_entrega_ativ_compl_view import *
from .views.solicitacao_view import *

from .views.disponibilidade_view import (
    DisponibilidadeListCreateView,
    DisponibilidadeRetrieveUpdateDestroyView,
    VerificarDisponibilidadeView
)

from .views.periodo_disponibilidade_view import (
    PeriodoDisponibilidadeListCreateView,
    PeriodoDisponibilidadeDetailView
)
from .views.permissoes_view import PermissaoListView

from .views.detalhe_formularios_view import *
from .views.atualizar_status_view import *

from .views.form_exercicios_domiciliares import FormExercicioDomiciliarViewSet

from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'formulario_exerc_dom', FormExercicioDomiciliarViewSet, basename='form_exerc')

from .views.listas_minhas_solicitacoes_view import ListarMinhasSolicitacoesView 


app_name = 'solicitacoes_app'
       
urlpatterns = [

    path('', include(router.urls)),
    
    path('', api_root, name="api-root"),
    path('saudacao/', saudacao, name="saudacao"),
    #path('solicitacoes/', include('solicitacoes_app.urls', namespace='solicitacoes_app')),

    path('cursos/', CursoListCreateView.as_view(), name='listar_cadastrar_cursos'),
    path('cursos/<str:codigo>/', CursoRetrieveUpdateDestroyView.as_view(), name='detalhar_atualizar_deletar_curso'),

    path('ppcs/', PpcListCreateView.as_view(), name='listar_cadastrar_ppcs'),
    path('ppcs/<path:codigo>/', PpcRetrieveUpdateDestroyView.as_view(), name='detalhar_atualizar_deletar_ppc'),


    path('motivo_abono/', MotivoAbonoListCreateView.as_view(), name='motivo_abono_list'),
    path('motivo_abono/<int:pk>/', MotivoAbonoRetrieveUpdateDestroyView.as_view(), name='motivo_abono_detail'),
    path('motivo_abono/tipos/', TipoFaltaView.as_view(), name='tipo_faltas'),

    path('motivo_dispensa/', MotivoDispensaListService.as_view(), name="listar_motivo_dispensa"),
    path('motivo_dispensa/<int:pk>/', MotivoDispensaService.as_view(), name="gerenciar_motivo_dispensa"),

    path('motivo_exercicios/', MotivoExerciciosListCreateView.as_view(), name="listar_motivo_exercicios"),
    path('motivo_exercicios/<int:pk>/', MotivoExerciciosRetrieveUpdateDestroyView.as_view(), name="crud_motivo_exercicios"),

    path('coordenadores/', CoordenadorListCreateView.as_view(), name='coordenador-list'),
    path('coordenadores/<int:pk>/', CoordenadorRetrieveUpdateDestroyView.as_view(), name='coordenador-detail'),

    path('cres/', CREListCreateView.as_view(), name='cre-list'),
    path('cres/<int:pk>/', CRERetrieveUpdateDestroyView.as_view(), name='cre-detail'),

    path('alunos/', AlunoListCreateView.as_view(), name='aluno-list'),
    path('alunos/<int:pk>/', AlunoRetrieveUpdateDestroyView.as_view(), name='aluno-detail'),
    path('alunos/listar/', AlunoListView.as_view(), name='aluno-list-antigo'),
    path('alunos/listar/<int:pk>/', AlunoRetrieveView.as_view(), name='aluno-detail-antigo'),
    path('alunos/buscar_por_cpf/', AlunoBuscarPorCpfView.as_view(), name='aluno-buscar-cpf'),

    path('disciplinas/', DisciplinaListCreateView.as_view(), name='disciplina-list'),
    path('disciplinas/<str:codigo>/', DisciplinaRetrieveUpdateDestroyView.as_view(), name='disciplina-detail'),

    path('grupos/', GrupoListCreateView.as_view(), name='grupo-list'),
    path('grupos/<int:pk>/', GrupoRetrieveUpdateDestroyView.as_view(), name='grupo-detail'),

    path('turmas/', TurmaListCreateView.as_view(), name='turma-list'),
    path('turmas/<int:id>/', TurmaRetrieveUpdateDestroyView.as_view(), name='turma-detail'),
    
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuario-list'),
    path('usuarios/<int:pk>/', UsuarioRetrieveUpdateDestroyView.as_view(), name='usuario-detail'),
    path('usuarios/emails-alunos/', AlunoEmailListView.as_view(), name='aluno-emails-list'),
    path('usuarios/<str:email>/', UsuarioListCreateView.as_view(), name='usuario-email'),
    path('usuarios/inativos/', UsuariosInativosView.as_view(), name='usuario-inativo'),
    path('usuarios/inativos/<int:pk>/', UsuarioReativarView.as_view(), name='usuario-reativar'),
    path('usuarios/aprovar/<int:pk>/', UsuarioAprovarCadastroView.as_view(), name='usuario-aprovar'),

    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),

    path('responsaveis/', ResponsavelListCreateView.as_view(), name='responsavel-list'),
    path('responsaveis/<int:pk>/', ResponsavelRetrieveUpdateDestroyView.as_view(), name='responsavel-detail'),
    
    path("formularios-trancamento/", FormTrancamentoCreateWithSolicitacaoView.as_view()),
    path("formularios-trancamento/<int:id>/", FormTrancamentoDetail.as_view()),

    path("dispensa_ed_fisica/", FormDispEdFisicaViewListCreate.as_view(), name='dispensa_ed_fisica_list_create'),
    path("dispensa_ed_fisica/<int:id>/", FormDispEdFisicaViewUpdateDelete.as_view(), name='dispensa_ed_fisica_update_delete'),

    path("anexos/", AnexoViewGetOrCreate.as_view(), name='anexos_listar_cadastrar'),
    path("anexos/<int:pk>/", AnexoViewUpdateOrDelete.as_view(), name='anexo_atualizar_deletar'),
    path("anexos/forms/<int:pk>/", AnexoGetFormDispensa.as_view(), name='listar_anexos_por-formulario'),
    
    path("formulario_abono_falta/", FormAbonoFaltaViewListCreate.as_view(), name='abono_falta_list_create'),
    path("formulario_abono_falta/<int:pk>/", FormAbonoFaltaViewUpdateDelete.as_view(), name='abono_falta_update_delete'),
    
    path("mandatos/", MandatoListCreateView.as_view(), name='mandato-list'),
    path("mandatos/<int:pk>/", MandatoRetrieveUpdateDestroyView.as_view(), name='mandato-detail'),
    path('mandatos/historico/', MandatoOrdenadoListView.as_view(), name='historico_mandatos_por_curso'),
    
    
    path("formulario_trancamento_disciplina/", FormTrancDisciplinaListCreate.as_view(), name="listar_cadastrar_form_trancamento_disciplina"),
    path("formulario_trancamento_disciplina/<int:id>/", FormTrancDisciplinaDetail.as_view(), name="detalhar_atualizar_deletar_form_trancamento_disciplina"),
    path("formulario_trancamento_disciplina/disciplinas/<str:curso_codigo>/", disciplinas_por_curso, name="disciplinas_por_curso"),

    path('form_desistencia_vaga/', FormDesistenciaVagaListCreate.as_view(), name='form_desistencia_vaga_create'),
    path('form_desistencia_vaga/<int:id>/', FormDesistenciaVagaDetail.as_view(), name='form_desistencia_vaga_detail'),

    path('nomes/', NomeListCreateView.as_view(), name='nome-list'),
    path('nomes/<str:pk>/', NomeRetrieveUpdateDestroyView.as_view(), name='nome-detail'),

    path('form_ativ_compl/', FormEntregaAtivComplListCreate.as_view(), name='form_ativ_compl_list_create'),
    path('form_ativ_compl/<int:id>/', FormEntregaAtivComplUpdate.as_view(), name='form_ativ_compl_update'),

    path('todas-solicitacoes/', SolicitacaoListCreate.as_view(), name='solicitacao-list-create'),
    path('todas-solicitacoes/<int:id>/', SolicitacaoRetrieveUpdateDestroyView.as_view(), name='solicitacao_update_delete'),

    path('disponibilidades/', DisponibilidadeListCreateView.as_view(), name='disponibilidade-list-create'),
    path('disponibilidades/<int:id>/', DisponibilidadeRetrieveUpdateDestroyView.as_view(), name='disponibilidade-detail'),
    path('disponibilidades/verificar/', VerificarDisponibilidadeView.as_view(), name='verificar-disponibilidade'),

    path('periodos-disponibilidade/', PeriodoDisponibilidadeListCreateView.as_view(), name='periodo-list-create'),
    path('periodos-disponibilidade/<int:id>/', PeriodoDisponibilidadeDetailView.as_view(), name='periodo-detail'),

    path('detalhes-formulario/<int:solicitacao_id>/', DetalhesFormularioView.as_view()),

    path("atualizar-status/<int:id>/", AtualizarStatusSolicitacaoView.as_view(), name="atualizar-status"),
    
    path('solicitacoes/permissoes/', PermissaoListView.as_view()),

    path('minhas-solicitacoes/', ListarMinhasSolicitacoesView.as_view(), name='listar_minhas_solicitacoes'),

    ]
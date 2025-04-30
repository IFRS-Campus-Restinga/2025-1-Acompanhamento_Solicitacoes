from django.urls import path
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
from .views.usuario_view import UsuarioListCreateView, UsuarioRetrieveUpdateDestroyView, UsuariosInativosView
from .views.responsavel_view import *
from .views.form_tranc_matricula_view import *
from .views.form_disp_ed_fisica_view import *
from .views.anexo_view import *
from .views.form_abono_falta_view import *
from .views.mandato_view import MandatoListCreateView, MandatoRetrieveUpdateDestroyView
from .views.form_tranc_disciplina_view import FormTrancDisciplinaListCreate, FormTrancDisciplinaDetail, disciplinas_por_curso
from .views.form_exercicios_domiciliares import (
    FormExercicioDomiciliarListCreate,
    FormExercicioDomiciliarDetail
)
from .views.form_desistencia_vaga_view import *

app_name = 'solicitacoes_app'


urlpatterns = [
    path('', api_root, name="api-root"),
    path('saudacao/', saudacao, name="saudacao"),


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
    path('coordenadores/<int:pk>', CoordenadorRetrieveUpdateDestroyView.as_view(), name='coordenador-detail'),

    path('cres/', CREListCreateView.as_view(), name='cre-list'),
    path('cres/<int:pk>', CRERetrieveUpdateDestroyView.as_view(), name='cre-detail'),

    path('alunos/', AlunoListCreateView.as_view(), name='aluno-list'),
    path('alunos/<int:pk>/', AlunoRetrieveUpdateDestroyView.as_view(), name='aluno-detail'),

    path('disciplinas/', DisciplinaListCreateView.as_view(), name='disciplina-list'),
    path('disciplinas/<str:codigo>/', DisciplinaRetrieveUpdateDestroyView.as_view(), name='disciplina-detail'),

    path('grupos/', GrupoListCreateView.as_view(), name='grupo-list'),
    path('grupos/<int:pk>/', GrupoRetrieveUpdateDestroyView.as_view(), name='grupo-detail'),

    path('turmas/', TurmaListCreateView.as_view(), name='turma-list'),
    path('turmas/<int:id>/', TurmaRetrieveUpdateDestroyView.as_view(), name='turma-detail'),
    
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuario-list'),
    path('usuarios/<int:pk>/', UsuarioRetrieveUpdateDestroyView.as_view(), name='usuario-detail'),
    path('usuarios/inativos/', UsuariosInativosView.as_view(), name='usuario-inativo'),

    path('responsaveis/', ResponsavelListCreateView.as_view(), name='responsavel-list'),
    path('responsaveis/<int:pk>/', ResponsavelRetrieveUpdateDestroyView.as_view(), name='responsavel-detail'),
    
    path("formularios-trancamento/",FormTrancamentoListCreate.as_view(),name="listar_cadastrar_form_trancamento",),
    path("formularios-trancamento/<int:id>/",FormTrancamentoDetail.as_view(),name="detalhar_atualizar_deletar_form_trancamento",),

    path("dispensa_ed_fisica/", FormDispEdFisicaViewListCreate.as_view(), name='dispensa_ed_fisica_list_create'),
    path("dispensa_ed_fisica/<int:id>/", FormDispEdFisicaViewUpdateDelete.as_view(), name='dispensa_ed_fisica_update_delete'),

    path("anexos/", AnexoViewGetOrCreate.as_view(), name='anexos_listar_cadastrar'),
    path("anexos/<int:pk>/", AnexoViewUpdateOrDelete.as_view(), name='anexo_atualizar_deletar'),
    path("anexos/forms/<int:pk>/", AnexoGetFormDispensa.as_view(), name='listar_anexos_por-formulario'),
    
    path("formulario_abono_falta/", FormAbonoFaltaViewListCreate.as_view(), name='abono_falta_list_create'),
    path("formulario_abono_falta/<int:pk>/", FormAbonoFaltaViewUpdateDelete.as_view(), name='abono_falta_update_delete'),
    
    path("mandatos/", MandatoListCreateView.as_view(), name='mandato-list'),
    path("mandatos/<int:pk>/", MandatoRetrieveUpdateDestroyView.as_view(), name='mandato-detail'),

    path("formulario_trancamento_disciplina/", FormTrancDisciplinaListCreate.as_view(), name="listar_cadastrar_form_trancamento_disciplina"),
    path("formulario_trancamento_disciplina/<int:id>/", FormTrancDisciplinaDetail.as_view(), name="detalhar_atualizar_deletar_form_trancamento_disciplina"),
    path("formulario_trancamento_disciplina/disciplinas/<str:curso_codigo>/", disciplinas_por_curso, name="disciplinas_por_curso"),

    path('form_exercicio_domiciliar/', FormExercicioDomiciliarListCreate.as_view(), name='exercicios-domiciliares-list-create'),
    path('form_exercicio_domiciliar/<int:id>/', FormExercicioDomiciliarDetail.as_view(), name='exercicios-domiciliares-detail'),

    path('form_desistencia_vaga/', FormDesistenciaVagaListCreate.as_view(), name='form_desistencia_vaga_create'),
    path('form_desistencia_vaga/<int:id>/', FormDesistenciaVagaDetail.as_view(), name='form_desistencia_vaga_detail'),

]
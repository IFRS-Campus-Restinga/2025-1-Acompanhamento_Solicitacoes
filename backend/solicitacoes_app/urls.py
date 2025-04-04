from django.urls import path
from .views.estaticas import api_root, saudacao
from .views.curso_view import *
from .views.ppc_view import *
from .views.motivo_abono_view import *
from .views.motivo_dispensa_view import *
from .views.motivo_exercicios_view import *
from .views.coordenador_view import CoordenadorListService, CoordenadorService
from .views.cre_view import CREListService, CREService
from .views.aluno_view import *
from .views.disciplina_view import *


app_name = 'solicitacoes_app'


urlpatterns = [
    path('', api_root, name="api-root"),
    path('saudacao/', saudacao, name="saudacao"),

    path('cursos/', CursoListCreateView.as_view(), name='listar_cadastrar_cursos'),
    path('cursos/<str:codigo>/', CursoRetrieveUpdateDestroyView.as_view(), name='detalhar_atualizar_deletar_curso'),

    path('ppcs/', PpcListCreateView.as_view(), name='listar_cadastrar_ppcs'),
    path('ppcs/<str:codigo>/', PpcRetrieveUpdateDestroyView.as_view(), name='detalhar_atualizar_deletar_ppc'),

    path('motivo_abono/', ListarMotivoAbono.as_view(), name='motivo_abono_listar'),
    path('motivo_abono/criar/', CadastrarMotivoAbono.as_view(), name='motivo_abono_cadastrar'),
    path('motivo_abono/<int:pk>/', DeletarMotivoAbono.as_view(), name='motivo_abono_detalhar'),
    path('motivo_abono/<int:pk>/atualizar/', AtualizarMotivoAbono.as_view(), name='motivo_abono_atualizar'),
    path('motivo_abono/<int:pk>/deletar/', DeletarMotivoAbono.as_view(), name='motivo_abono_deletar'),

    path('motivo_dispensa/', ListarMotivoDispensa.as_view(), name="listar_motivo_dispensa"),
    path('motivo_dispensa/cadastrar/', CadastrarMotivoDispensa.as_view(), name="cadastrar_motivo_dispensa"),
    path('motivo_dispensa/<int:id>/atualizar/', AtualizarMotivoDispensa.as_view(), name="atualizar_motivo_dispensa"),
    path('motivo_dispensa/<int:id>/deletar/', DeletarMotivoDispensa.as_view(), name="excluir_motivo_dispensa"),

    path('motivo_exercicios/', ListarMotivoExercicios.as_view(), name="listar_motivo_exercicios"),
    path('motivo_exercicios/<int:pk>', MotivoExerciciosService.as_view(), name="detalhes_motivo_exercicios"),

    path('coordenadores/', CoordenadorListService.as_view(), name='coordenador-list'),
    path('coordenadores/<int:pk>', CoordenadorService.as_view(), name='coordenador-detail'),

    path('cres/', CREListService.as_view(), name='cre-list'),
    path('cres/<int:pk>', CREService.as_view(), name='cre-detail'),

    path('alunos/', listar_alunos, name='listar_alunos'),
    path('alunos/cadastrar/', cadastrar_aluno, name='cadastrar_aluno'),
    path('alunos/<int:aluno_id>/', obter_aluno, name='obter_aluno'),
    path('alunos/<int:aluno_id>/atualizar/', atualizar_aluno, name='atualizar_aluno'),
    path('alunos/<int:aluno_id>/deletar/', deletar_aluno, name='deletar_aluno'),

    path('disciplinas/', disciplina_list_create, name='listar_disciplinas'),
    path('disciplinas/cadastrar/', disciplina_list_create, name='cadastrar_disciplina'),
    path('disciplinas/<str:pk>/', disciplina_detail, name='obter_disciplina'),
    path('disciplinas/<str:pk>/atualizar/', disciplina_detail, name='atualizar_disciplina'),
    path('disciplinas/<str:pk>/deletar/', disciplina_detail, name='deletar_disciplina'),
]
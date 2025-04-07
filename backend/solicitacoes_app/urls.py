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

app_name = 'solicitacoes_app'


urlpatterns = [
    path('', api_root, name="api-root"),
    path('saudacao/', saudacao, name="saudacao"),

    path('cursos/', listar_cursos, name='listar_cursos'),
    path('cursos/cadastrar/', cadastrar_curso, name='cadastrar_curso'),
    path('cursos/<str:curso_codigo>/', obter_curso, name='obter_curso'),
    path('cursos/<str:curso_codigo>/atualizar/', atualizar_curso, name='atualizar_curso'),
    path('cursos/<str:curso_codigo>/deletar/', deletar_curso, name='deletar_curso'),

    path('ppcs/', listar_ppcs, name='listar_ppcs'),
    path('ppcs/cadastrar/', cadastrar_ppc, name='cadastrar_ppc'),
    path('ppcs/<str:ppc_codigo>/', obter_ppc, name='obter_ppc'),
    path('ppcs/<str:ppc_codigo>/atualizar/', atualizar_ppc, name='atualizar_ppc'),
    path('ppcs/<str:ppc_codigo>/deletar/', deletar_ppc, name='deletar_ppc'),

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
    path('motivo_exercicios/<int:pk>/', CRUDMotivoExercicios.as_view(), name="crud_motivo_exercicios"),

    path('coordenadores/', CoordenadorListCreateView.as_view(), name='coordenador-list'),
    path('coordenadores/<int:pk>', CoordenadorRetrieveUpdateDestroyView.as_view(), name='coordenador-detail'),

    path('cres/', CREListCreateView.as_view(), name='cre-list'),
    path('cres/<int:pk>', CRERetrieveUpdateDestroyView.as_view(), name='cre-detail'),

    path('alunos/', listar_alunos, name='listar_alunos'),
    path('alunos/cadastrar/', cadastrar_aluno, name='cadastrar_aluno'),
    path('alunos/<int:aluno_id>/', obter_aluno, name='obter_aluno'),
    path('alunos/<int:aluno_id>/atualizar/', atualizar_aluno, name='atualizar_aluno'),
    path('alunos/<int:aluno_id>/deletar/', deletar_aluno, name='deletar_aluno'),

    path('disciplinas/', DisciplinaListCreateView.as_view(), name='disciplina-list'),
    path('disciplinas/<str:pk>/', DisciplinaRetrieveUpdateDestroyView.as_view(), name='disciplina-detail'),
]
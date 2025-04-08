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

    path('motivo_abono/', MotivoAbonoListCreateView.as_view(), name='motivo_abono_list'),
    path('motivo_abono/<int:pk>/', MotivoAbonoRetrieveUpdateDestroyView.as_view(), name='motivo_abono_detail'),
    

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
    path('disciplinas/<str:pk>/', DisciplinaRetrieveUpdateDestroyView.as_view(), name='disciplina-detail'),
]
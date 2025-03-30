from django.urls import path
from .views.estaticas import api_root, saudacao
from .views.curso_view import *
from .views.ppc_view import *
from .views.motivo_abono_view import *

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

    path('motivo_abono/', listar_motivos_abono, name='motivo_abono_listar'),
    path('motivo_abono/criar/', criar_motivo_abono, name='motivo_abono_criar'),
    path('motivo_abono/<int:pk>/', detalhar_motivo_abono, name='motivo_abono_detalhar'),
    path('motivo_abono/<int:pk>/atualizar/', atualizar_motivo_abono, name='motivo_abono_atualizar'),
    path('motivo_abono/<int:pk>/deletar/', deletar_motivo_abono, name='motivo_abono_deletar'),
]
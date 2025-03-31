from django.urls import path
from .views.estaticas import api_root, saudacao
from .views.curso_view import *
from .views.ppc_view import *
from .views.motivo_dispensa_view import *

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

    path('motivo_dispensa/', ListarMotivoDispensa.as_view(), name="listar_motivo_dispensa"),
    path('motivo_dispensa/cadastrar/', CadastrarMotivoDispensa.as_view(), name="cadastrar_motivo_dispensa"),
    path('motivo_dispensa/<int:id>/atualizar/', AtualizarMotivoDispensa.as_view(), name="atualizar_motivo_dispensa"),
    path('motivo_dispensa/<int:id>/deletar/', DeletarMotivoDispensa.as_view(), name="excluir_motivo_dispensa"),

]
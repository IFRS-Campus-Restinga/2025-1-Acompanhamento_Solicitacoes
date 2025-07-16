from django.urls import path, include

from .views.estaticas import api_root, saudacao
from .views.curso_view import *
from .views.ppc_view import *

from .views.coordenador_view import CoordenadorListCreateView, CoordenadorRetrieveUpdateDestroyView
from .views.cre_view import CREListCreateView, CRERetrieveUpdateDestroyView
from .views.aluno_view import *
from .views.disciplina_view import (
    DisciplinaListCreateView,
    DisciplinaRetrieveUpdateDestroyView,
    DisciplinasPorCursoView,
    DisciplinasPorPpcPeriodoView, # <-- Garanta que essa está aqui
)
from .views.campos_solic_views.tipo_falta_view import *
from .views.grupo_view import *
from solicitacoes_app.views.turma_view import *
from .views.usuario_view import UsuarioListCreateView, UsuarioRetrieveUpdateDestroyView, UsuariosInativosView, AlunoEmailListView, UsuarioReativarView, UsuarioAprovarCadastroView,  UsuarioDetailByEmail
from .views.responsavel_view import *
from .views.anexo_view import *
from .views.mandato_view import MandatoOrdenadoListView, MandatoListCreateView, MandatoRetrieveUpdateDestroyView

##FORMS
from .views.forms.form_abono_falta_view import *
from .views.forms.form_tranc_matricula_view import *
from .views.forms.form_disp_ed_fisica_view import *
from .views.forms.form_tranc_disciplina_view import *
from .views.forms.form_desistencia_vaga_view import *
from .views.forms.form_exercicios_domiciliares_view import *

from .views.nome_view import *
from .views.perfil_usuario_view import *
from .views.forms.form_entrega_ativ_compl_view import *
from .views.solicitacao_view import *

from .views.atualizar_status_view import AtualizarStatusSolicitacaoView
# from .views.INATIVO_listas_minhas_solicitacoes_view import ListarMinhasSolicitacoesView

#Motivos / Campos de SOlicitações
from .views.campos_solic_views.motivo_abono_view import *
from .views.campos_solic_views.motivo_dispensa_view import *
from .views.campos_solic_views.motivo_exercicios_view import *
from .views.campos_solic_views.motivo_desistencia_view import *
from .views.campos_solic_views.atividade_complementar_view import *
from .views.forms.form_interprete_libras_view import *

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
from .views.INATIVO_atualizar_status_view import *

# from .views.form_exercicios_domiciliares_view import FormExercicioDomiciliarViewSet, FormExercicioDomiciliarGetView, FormularioExercDomUdpate

from rest_framework.routers import DefaultRouter
router = DefaultRouter()
# router.register(r'formulario_exerc_dom', FormExercicioDomiciliarViewSet, basename='form_exerc')

from .views.solicitacao_view import MinhasSolicitacoesListView 

from .views.historico_afastamento_view import HistoricoAfastamentoViewList

from .views.solicitacao_view import SolicitacaoListAllView


## URLS IMPORTCOES NOVAS:
from .views import (
    solicitacao_view,
    atualizar_status_view,
    # REMOVIDO: form_abono_falta_view, pois já é importado via from .forms.form_abono_falta_view import *
)

# =================================================================================
# 2. MAPA DE VIEWS (O padrão que você gostou, agora com os nomes corretos)
# Aqui mapeamos a chave da URL para a classe de view correta.
# =================================================================================

# Supondo que em cada arquivo você tenha uma classe ...ListCreateView
FORM_LIST_CREATE_VIEWS = {
    'trancamento-matricula': FormTrancamentoListCreateView,
    'trancamento-disciplina': FormTrancDisciplinaListCreateView,
    'abono-falta': FormAbonoFaltaListCreateView, # Usando a classe diretamente, já que o módulo foi importado com *
    'exercicios-domiciliares': FormExercicioDomiciliarListCreateView,
    'dispensa-ed-fisica': FormDispEdFisicaListCreateView,
    'entrega-ativ-compl': FormEntregaAtivComplListCreateView,
    'desistencia-vaga': FormDesistenciaVagaListCreateView,
}

# Supondo que em cada arquivo você tenha uma classe ...RetrieveUpdateDestroyView
FORM_DETAIL_VIEWS = {
    'trancamento-matricula': FormTrancamentoRetrieveUpdateDestroyView,
    'trancamento-disciplina': FormTrancDisciplinaRetrieveUpdateDestroyView,
    'abono-falta': FormAbonoFaltaRetrieveUpdateDestroyView, # Usando a classe diretamente, já que o módulo foi importado com *
    'exercicios-domiciliares': FormExercicioDomiciliarRetrieveUpdateDestroyView,
    'dispensa-ed-fisica': FormDispEdFisicaRetrieveUpdateDestroyView,
    'entrega-ativ-compl': FormEntregaAtivComplRetrieveUpdateDestroyView,
    'desistencia-vaga': FormDesistenciaVagaRetrieveUpdateDestroyView,
}


app_name = 'solicitacoes_app'
       
urlpatterns = [

    path('', include(router.urls)),
    
    path('', api_root, name="api-root"),
    path('saudacao/', saudacao, name="saudacao"),
    #path('solicitacoes/', include('solicitacoes_app.urls', namespace='solicitacoes_app')),

    path('disciplinas/por-curso/<path:curso_codigo>/',DisciplinasPorCursoView.as_view(),name='disciplinas-por-curso'),
    path('disciplinas/por-ppc-periodo/',DisciplinasPorPpcPeriodoView.as_view(),name='disciplinas-por-ppc-periodo'),

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

    path('motivos-desistencia/', MotivoDesistenciaListCreateView.as_view(), name='motivos-desistencia-list'),
    path('motivos-desistencia/<int:pk>/', MotivoDesistenciaRetrieveUpdateDestroyView.as_view(), name='motivos-desistencia-detail'),
    path('atividades-complementares/', AtividadeComplementarListCreateView.as_view(), name='atividades-complementares-list'),
    path('atividades-complementares/<int:pk>/', AtividadeComplementarRetrieveUpdateDestroyView.as_view(), name='atividades-complementares-detail'),

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
    path('usuarios/inativos/', UsuariosInativosView.as_view(), name='usuario-inativo'),
    path('usuarios/inativos/<int:pk>/', UsuarioReativarView.as_view(), name='usuario-reativar'),
    path('usuarios/aprovar/<int:pk>/', UsuarioAprovarCadastroView.as_view(), name='usuario-aprovar'),
    path('usuarios/buscar-por-email/<str:email>/', UsuarioDetailByEmail.as_view(), name='usuario-detail-by-email'), # Nova URL para busca por email

    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),

    path('responsaveis/', ResponsavelListCreateView.as_view(), name='responsavel-list'),
    path('responsaveis/<int:pk>/', ResponsavelRetrieveUpdateDestroyView.as_view(), name='responsavel-detail'),

    path("anexos/", AnexoViewGetOrCreate.as_view(), name='anexos_listar_cadastrar'),
    path("anexos/<int:pk>/", AnexoViewUpdateOrDelete.as_view(), name='anexo_atualizar_deletar'),
    path("anexos/forms/<int:pk>/", AnexoGetFormDispensa.as_view(), name='listar_anexos_por-formulario'),
    
    path("formulario_abono_falta/", FormAbonoFaltaListCreateView.as_view(), name='abono_falta_list_create'),
    path("formulario_abono_falta/<int:pk>/", FormAbonoFaltaRetrieveUpdateDestroyView.as_view(), name='abono_falta_update_delete'),
    
    path("mandatos/", MandatoListCreateView.as_view(), name='mandato-list'),
    path("mandatos/<int:pk>/", MandatoRetrieveUpdateDestroyView.as_view(), name='mandato-detail'),
    path('mandatos/historico/', MandatoOrdenadoListView.as_view(), name='historico_mandatos_por_curso'),
    
    #  # URL antiga de disciplinas por curso (para ser removida ou renomeada se usada em outros lugares)
    # path("formulario_trancamento_disciplina/disciplinas/<str:curso_codigo>/", disciplinas_por_curso, name="disciplinas_por_curso"),
    # # NOVA URL para buscar disciplinas por PPC e período (a ser usada no seu formulário de exercícios)
    # path("disciplinas_por_ppc_e_periodo/", disciplinas_por_ppc_e_periodo, name="disciplinas_por_ppc_e_periodo"),
    #path('disciplinas/por-curso/<path:curso_codigo>/',DisciplinasPorCursoView.as_view(),name='disciplinas-por-curso'),
    #path('disciplinas/por-ppc-periodo/',DisciplinasPorPpcPeriodoView.as_view(),name='disciplinas-por-ppc-periodo'),

    path('nomes/', NomeListCreateView.as_view(), name='nome-list'),
    path('nomes/<str:pk>/', NomeRetrieveUpdateDestroyView.as_view(), name='nome-detail'),
    # path('todas-solicitacoes/', SolicitacaoListCreate.as_view(), name='solicitacao-list-create'),
    # path('todas-solicitacoes/<int:id>/', SolicitacaoRetrieveUpdateDestroyView.as_view(), name='solicitacao_update_delete'),

    path('disponibilidades/', DisponibilidadeListCreateView.as_view(), name='disponibilidade-list-create'),
    path('disponibilidades/<int:id>/', DisponibilidadeRetrieveUpdateDestroyView.as_view(), name='disponibilidade-detail'),
    path('disponibilidades/verificar/', VerificarDisponibilidadeView.as_view(), name='verificar-disponibilidade'),

    path('periodos-disponibilidade/', PeriodoDisponibilidadeListCreateView.as_view(), name='periodo-list-create'),
    path('periodos-disponibilidade/<int:id>/', PeriodoDisponibilidadeDetailView.as_view(), name='periodo-detail'),

    path('detalhes-formulario/<int:solicitacao_id>/', DetalhesFormularioView.as_view()),

    path("atualizar-status/<str:form_type_key>/<int:pk>/", AtualizarStatusSolicitacaoView.as_view(), name="atualizar-status"),
    
    path('solicitacoes/permissoes/', PermissaoListView.as_view()),

    path('minhas-solicitacoes/', MinhasSolicitacoesListView.as_view(), name='listar_minhas_solicitacoes'),
    
    path('formularios/<str:form_type_key>/<int:pk>/status/', atualizar_status_view.AtualizarStatusSolicitacaoView.as_view(), name='atualizar-status-solicitacao'),

    path('form_exerc_dom/historico/<int:id>/', HistoricoAfastamentoViewList.as_view(), name="historico_afastamento"),

    path('coordenador/listar-solicitacoes/', SolicitacoesDoCoordenador.as_view(), name="listar_solicitacoes_coordenador"),

    path('cre/listar-solicitacoes/', SolicitacaoListAllView.as_view(), name="listar-solicitacoes-cre" ),
    
    path('notifications/', include('solicitacoes_app.notifications.urls')),

    path('form_interp_libras/', FormInterpreteLibrasListCreateView.as_view(), name="interprete-libras-list-create-view")
  
]

for key, ViewClass in FORM_LIST_CREATE_VIEWS.items():
    urlpatterns.append(
        path(f'formularios/{key}/', ViewClass.as_view(), name=f'form-{key}-list-create')
    )

for key, ViewClass in FORM_DETAIL_VIEWS.items():
    urlpatterns.append(
        path(f'formularios/{key}/<int:pk>/', ViewClass.as_view(), name=f'form-{key}-detail')
    )


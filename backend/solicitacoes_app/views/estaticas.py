from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.permissions import AllowAny, IsAuthenticated
from solicitacoes_app.permissoes import IsCREForManagement, IsCoordenador, IsAluno, IsResponsavel, IsExterno


@api_view(["GET"])
@permission_classes([AllowAny]) # Saudação pode ser acessada por qualquer um
def saudacao(request):
    return Response({"saudacao": "Olá Mundo"})


@api_view(["GET"])
@permission_classes([IsAuthenticated]) # Acesso à raiz da API requer autenticação
def api_root(request, format=None):
    user = request.user
    response_data = {}

    # Links gerais que todos autenticados podem ver ou que são públicos
    response_data["saudacao"] = reverse("solicitacoes_app:saudacao", request=request, format=format)

    # Links específicos por grupo
    if IsCREForManagement().has_permission(request, None): # CRE tem acesso a tudo
        response_data["cursos"] = reverse("solicitacoes_app:listar_cadastrar_cursos", request=request, format=format)
        response_data["ppcs"] = reverse("solicitacoes_app:listar_cadastrar_ppcs", request=request, format=format)
        response_data["alunos"] = reverse("solicitacoes_app:aluno-list", request=request, format=format)
        response_data["responsaveis"] = reverse("solicitacoes_app:responsavel-list", request=request, format=format)
        response_data["coordenadores"] = reverse("solicitacoes_app:coordenador-list", request=request, format=format)
        response_data["cres"] = reverse("solicitacoes_app:cre-list", request=request, format=format)
        response_data["motivo_dispensa"] = reverse("solicitacoes_app:listar_motivo_dispensa", request=request, format=format)
        response_data["disciplinas"] = reverse("solicitacoes_app:disciplina-list", request=request, format=format)
        response_data["motivo_exercicios"] = reverse("solicitacoes_app:listar_motivo_exercicios", request=request, format=format)
        response_data["motivo_abono"] = reverse("solicitacoes_app:motivo_abono_list", request=request, format=format)
        response_data["turmas"] = reverse("solicitacoes_app:turma-list", request=request, format=format)
        response_data["usuarios"] = reverse("solicitacoes_app:usuario-list", request=request, format=format)
        response_data["mandato"] = reverse("solicitacoes_app:mandato-list", request=request, format=format)
        response_data["form_tranc_disciplina"] = reverse("solicitacoes_app:listar_cadastrar_form_trancamento_disciplina", request=request, format=format)
        response_data["form_desistencia_vaga"] = reverse("solicitacoes_app:form_desistencia_vaga_create", request=request, format=format)
        # Adicionar outros formulários aqui se o CRE tiver acesso direto a eles

    elif IsCoordenador().has_permission(request, None):
        # Coordenador pode ver disciplinas e talvez algumas listas de solicitações
        response_data["disciplinas"] = reverse("solicitacoes_app:disciplina-list", request=request, format=format)
        # Adicionar links para solicitações que o coordenador pode responder

    elif IsAluno().has_permission(request, None) or IsResponsavel().has_permission(request, None):
        # Aluno e Responsável podem criar e ver suas próprias solicitações
        response_data["form_tranc_disciplina"] = reverse("solicitacoes_app:listar_cadastrar_form_trancamento_disciplina", request=request, format=format)
        response_data["form_desistencia_vaga"] = reverse("solicitacoes_app:form_desistencia_vaga_create", request=request, format=format)
        # Adicionar links para outros formulários que Aluno/Responsável podem criar

    elif IsExterno().has_permission(request, None):
        # Externo só pode criar desistência de vaga
        response_data["form_desistencia_vaga"] = reverse("solicitacoes_app:form_desistencia_vaga_create", request=request, format=format)

    return Response(response_data)



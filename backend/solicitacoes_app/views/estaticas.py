from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def saudacao(request):
    return Response({"saudacao": "Olá Mundo"})


@api_view(['GET'])
def api_root(request, format=None):
    """
     View que permitirá retornar um objeto JSON com todos os endpoints implementados..
    """
    return Response({
        'saudacao': reverse('solicitacoes_app:saudacao', request=request, format=format),

        'cursos': {
            'listar/cadastrar': reverse('solicitacoes_app:curso-list-create', request=request, format=format),
            'detalhar/editar/deletar': '[cursos/<codigo>/]'
        },

        'ppcs': {
            'listar/cadastrar': reverse('solicitacoes_app:ppc-list-create', request=request, format=format),
            'detalhar/editar/deletar': '[ppcs/<codigo>/]'
        },
        'alunos': {
            'listar': reverse('solicitacoes_app:listar_alunos', request=request, format=format),
            'cadastrar': reverse('solicitacoes_app:cadastrar_aluno', request=request, format=format)
        },

        'coordenadores': reverse('solicitacoes_app:coordenador-list', request=request, format=format),

        'cres': reverse('solicitacoes_app:cre-list', request=request, format=format),

    })
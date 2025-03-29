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
            'listar': reverse('solicitacoes_app:listar_cursos', request=request, format=format),
            'cadastrar': reverse('solicitacoes_app:cadastrar_curso', request=request, format=format)
        },

        'ppcs': {
            'listar': reverse('solicitacoes_app:listar_ppcs', request=request, format=format),
            'cadastrar': reverse('solicitacoes_app:cadastrar_ppc', request=request, format=format)
        },
    })
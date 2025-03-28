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
    })
from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.cre_serializer import CRESerializer
from solicitacoes_app.models import CRE


class CREListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar CREs.
    """
    
    queryset = CRE.objects.all()
    serializer_class = CRESerializer
    permission_classes = [AllowAny]

class CRERetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar uma CRE.
    """
    
    queryset = CRE.objects.all()
    serializer_class = CRESerializer
    permission_classes = [AllowAny]
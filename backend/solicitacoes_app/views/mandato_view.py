from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.mandato_serializer import MandatoSerializer
from solicitacoes_app.models import Mandato


class MandatoListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar mandatos.
    """
    
    queryset = Mandato.objects.all()
    serializer_class = MandatoSerializer
    permission_classes = [AllowAny]

class MandatoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um mandato específico.
    """
    
    queryset = Mandato.objects.all()
    serializer_class = MandatoSerializer
    permission_classes = [AllowAny]
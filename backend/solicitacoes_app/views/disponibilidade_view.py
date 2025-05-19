from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.disponibilidade_serializer import DisponibilidadeSerializer
from ..models import Disponibilidade

class DisponibilidadeListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar registros de disponibilidade de formulários.
    Permissão temporária: AllowAny (aberto para todos).
    """
    queryset = Disponibilidade.objects.all()
    serializer_class = DisponibilidadeSerializer
    permission_classes = [AllowAny]

class DisponibilidadeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar ou deletar uma disponibilidade específica.
    Permissão temporária: AllowAny (aberto para todos).
    """
    queryset = Disponibilidade.objects.all()
    serializer_class = DisponibilidadeSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'  # Agora usando 'id' como identificador (ao invés de 'codigo')
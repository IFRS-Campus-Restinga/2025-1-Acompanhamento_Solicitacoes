from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Turma
from ..serializers.turma_serializer import TurmaSerializer


class TurmaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar turmas.
    """
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer
    permission_classes = [AllowAny]


class TurmaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar e deletar uma turma específica.
    """
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'  # Se você usar o campo 'id' para recuperar a turma faça nesse molde
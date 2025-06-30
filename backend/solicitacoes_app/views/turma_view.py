from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from ..models import Turma
from ..serializers.turma_serializer import TurmaSerializer
from ..permissoes import IsCREForManagement

class TurmaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar turmas.
    """
    queryset = Turma.objects.all().prefetch_related("disciplinas")  # Ajuste para carregar as disciplinas corretamente
    serializer_class = TurmaSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode listar e criar turmas

class TurmaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar e deletar uma turma específica.
    """
    queryset = Turma.objects.all().prefetch_related("disciplinas")  # Também aqui para garantir que as disciplinas sejam carregadas
    serializer_class = TurmaSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode gerenciar turmas
    lookup_field = "id"



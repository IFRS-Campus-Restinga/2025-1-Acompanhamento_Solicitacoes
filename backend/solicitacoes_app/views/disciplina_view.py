from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.disciplina_serializer import DisciplinaSerializer
from ..models import Disciplina


class DisciplinaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar disciplinas.
    """
    queryset = Disciplina.objects.all()  # Use filter caso queira aplicar algum filtro, por exemplo: .filter(ativo=True)
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]


class DisciplinaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar e deletar uma disciplina específica.
    """
    queryset = Disciplina.objects.all()  # Use filter caso queira aplicar algum filtro, por exemplo: .filter(ativo=True)
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'codigo'  # Se você usar o campo 'codigo' para recuperar a disciplina
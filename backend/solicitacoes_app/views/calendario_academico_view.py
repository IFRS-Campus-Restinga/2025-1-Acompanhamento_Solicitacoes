from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.calendario_academico_serializer import CalendarioAcademicoSerializer
from ..models import Disponibilidade

class CalendarioAcademicoListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar prazos no calendário acadêmico.
    Permissão temporária: AllowAny (aberto para todos).
    """
    queryset = Disponibilidade.objects.all()
    serializer_class = CalendarioAcademicoSerializer
    permission_classes = [AllowAny]

class CalendarioAcademicoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar ou deletar um prazo específico.
    Permissão temporária: AllowAny (aberto para todos).
    """
    queryset = Disponibilidade.objects.all()
    serializer_class = CalendarioAcademicoSerializer
    permission_classes = [AllowAny]
    lookup_field = 'codigo'  # Usa o campo 'codigo' como identificador (como definido no model)
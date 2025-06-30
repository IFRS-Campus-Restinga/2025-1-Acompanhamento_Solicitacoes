from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import PeriodoDisponibilidade
from ..serializers.periodo_disponibilidade_serializer import PeriodoDisponibilidadeSerializer
from ..permissoes import IsCREForManagement

class PeriodoDisponibilidadeListCreateView(generics.ListCreateAPIView):
    queryset = PeriodoDisponibilidade.objects.all()
    serializer_class = PeriodoDisponibilidadeSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode listar e criar períodos de disponibilidade

    def get_queryset(self):
        # Filtra períodos por formulário (opcional)
        formulario_id = self.request.query_params.get("formulario_id")
        if formulario_id:
            return self.queryset.filter(disponibilidade_id=formulario_id)
        
        # Apenas CRE pode ver todos os períodos
        if IsCREForManagement().has_permission(self.request, self):
            return self.queryset.all()
        return PeriodoDisponibilidade.objects.none()

class PeriodoDisponibilidadeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PeriodoDisponibilidade.objects.all()
    serializer_class = PeriodoDisponibilidadeSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode gerenciar detalhes de períodos de disponibilidade
    lookup_field = "id"



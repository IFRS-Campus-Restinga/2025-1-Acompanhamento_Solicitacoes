from rest_framework import generics
from ..models import PeriodoDisponibilidade
from ..serializers.periodo_disponibilidade_serializer import PeriodoDisponibilidadeSerializer

class PeriodoDisponibilidadeListCreateView(generics.ListCreateAPIView):
    queryset = PeriodoDisponibilidade.objects.all()
    serializer_class = PeriodoDisponibilidadeSerializer

    def get_queryset(self):
        # Filtra períodos por formulário (opcional)
        formulario_id = self.request.query_params.get('formulario_id')
        if formulario_id:
            return self.queryset.filter(disponibilidade_id=formulario_id)
        return self.queryset

class PeriodoDisponibilidadeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PeriodoDisponibilidade.objects.all()
    serializer_class = PeriodoDisponibilidadeSerializer
    lookup_field = 'id'
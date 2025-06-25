from rest_framework import generics
from ..models.forms.historico_afastamento import HistoricoAfastamento
from rest_framework.permissions import IsAuthenticated
from ..serializers.historico_afastamento_serializer import HistoricoAfastamentoSerializer

class HistoricoAfastamentoViewList(generics.ListCreateAPIView):
    
    permission_classes = [IsAuthenticated]
    serializer_class = HistoricoAfastamentoSerializer

    def get_queryset(self):
        queryset = HistoricoAfastamento.objects.all()
        form_exercicio_domiciliar_id = self.request.query_params.get('form_exercicio_domiciliar_id', None)

        if form_exercicio_domiciliar_id is not None:
            queryset = queryset.filter(form_exercicio_domiciliar_id=form_exercicio_domiciliar_id)

        return queryset
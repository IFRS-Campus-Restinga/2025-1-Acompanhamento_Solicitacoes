from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models.forms.historico_afastamento import HistoricoAfastamento
from ..serializers.historico_afastamento_serializer import HistoricoAfastamentoSerializer
from ..permissoes import IsCREForManagement, CanViewHistoricoAfastamento
from ..models.status import Status

class HistoricoAfastamentoViewList(generics.ListCreateAPIView):
    
    permission_classes = [IsAuthenticated, IsCREForManagement | CanViewHistoricoAfastamento] # CRE pode criar/listar, outros podem listar os seus
    serializer_class = HistoricoAfastamentoSerializer

    def get_queryset(self):
        queryset = HistoricoAfastamento.objects.all()
        form_exercicio_domiciliar_id = self.request.query_params.get("form_exercicio_domiciliar_id", None)

        if form_exercicio_domiciliar_id is not None:
            queryset = queryset.filter(form_exercicio_domiciliar_id=form_exercicio_domiciliar_id)
        
        # Se o usuário não for CRE, filtra por histórico de afastamento do próprio usuário
        if not IsCREForManagement().has_permission(self.request, self):
            # Esta lógica precisa ser mais refinada para associar o histórico ao usuário logado
            # Por exemplo, se HistoricoAfastamento tiver um campo 'usuario' ou 'aluno'
            # Por simplicidade, para este exemplo, se não for CRE, retorna vazio ou filtra por um campo relacionado ao usuário
            # Ex: queryset = queryset.filter(form_exercicio_domiciliar__aluno__usuario=self.request.user)
            return HistoricoAfastamento.objects.none() # Temporário, precisa de lógica de filtro por usuário

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        historico = HistoricoAfastamento.objects.filter(aluno__usuario=user,
                                                        ).order_by('-data_solicitacao').first()
        if historico is not None:
            if historico.status == Status.EM_ANALISE:
                historico.status = Status.INATIVO
                historico.save()
        

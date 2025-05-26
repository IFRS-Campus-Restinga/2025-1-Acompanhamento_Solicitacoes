from rest_framework import generics
from ..models import Solicitacao
from ..serializers.solicitacao_serializer import SolicitacaoSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

class SolicitacaoListCreate(generics.ListCreateAPIView):
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
    
    def perform_create(self, serializer):
        # Verifica disponibilidade antes de criar
        nome_formulario = serializer.validated_data.get('nome_formulario')
        if nome_formulario:
            from ..models import Disponibilidade
            try:
                disp = Disponibilidade.objects.get(
                    formulario=nome_formulario,
                    ativo=True
                )
                hoje = timezone.now().date()
                if not disp.sempre_disponivel and (hoje < disp.data_inicio or hoje > disp.data_fim):
                    raise PermissionDenied("Este formulário não está disponível no momento.")
            except Disponibilidade.DoesNotExist:
                pass
        serializer.save()

class SolicitacaoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
    lookup_field = 'id'
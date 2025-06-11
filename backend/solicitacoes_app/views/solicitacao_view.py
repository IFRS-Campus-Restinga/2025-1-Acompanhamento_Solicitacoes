from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import Solicitacao
from ..serializers.polymorphic_serializer import SolicitacaoPolymorphicSerializer
from ..permissoes import CanViewSolicitacaoDetail # Sua permissão

class SolicitacaoListView(generics.ListAPIView):
    """
    View para LISTAR TODAS as solicitações de todos os tipos.
    """
    queryset = Solicitacao.objects.all().select_related('aluno__usuario')
    serializer_class = SolicitacaoPolymorphicSerializer
    permission_classes = [IsAuthenticated]
    
class SolicitacaoDetailView(generics.RetrieveAPIView):
    """
    View para VER os detalhes de UMA solicitação específica,
    independentemente do seu tipo.
    """
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoPolymorphicSerializer
    lookup_field = 'id'
    permission_classes = [CanViewSolicitacaoDetail]
        
from rest_framework import generics
from ..models import Solicitacao
from ..serializers.solicitacao_serializer import SolicitacaoSerializer
from rest_framework.permissions import AllowAny 

class SolicitacaoListCreate(generics.ListCreateAPIView):
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
    permission_classes = [AllowAny] 
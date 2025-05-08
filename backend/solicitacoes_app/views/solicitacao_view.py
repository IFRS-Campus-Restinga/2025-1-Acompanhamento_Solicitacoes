from rest_framework import generics
from ..models import Solicitacao
from ..serializers import SolicitacaoSerializer

class SolicitacaoListCreate(generics.ListCreateAPIView):
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
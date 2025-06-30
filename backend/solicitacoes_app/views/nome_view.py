from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from ..models import Nome
from ..serializers.nome_serializer import NomeSerializer
from ..permissoes import IsCREForManagement

class NomeListCreateView(ListCreateAPIView):
    queryset = Nome.objects.all()
    serializer_class = NomeSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode gerenciar Nomes

class NomeRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Nome.objects.all()
    serializer_class = NomeSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode gerenciar Nomes
    lookup_field = "pk"  # ou \'nome\' se preferir trabalhar com o valor do campo primário



from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from ..models import Nome
from ..serializers.nome_serializer import NomeSerializer

class NomeListCreateView(ListCreateAPIView):
    queryset = Nome.objects.all()
    serializer_class = NomeSerializer

class NomeRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Nome.objects.all()
    serializer_class = NomeSerializer
    lookup_field = 'pk'  # ou 'nome' se preferir trabalhar com o valor do campo primário
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from ..serializers.anexo_serializer import AnexoSerializer
from ..models.anexo import Anexo
from rest_framework.permissions import AllowAny

class AnexoViewGetOrCreate(ListCreateAPIView):
    serializer_class = AnexoSerializer
    queryset = Anexo.objects.all()
    permission_classes = [AllowAny]

class AnexoViewUpdateOrDelete(RetrieveUpdateDestroyAPIView):
    serializer_class = AnexoSerializer
    queryset = Anexo.objects.all()
    permission_classes = [AllowAny]
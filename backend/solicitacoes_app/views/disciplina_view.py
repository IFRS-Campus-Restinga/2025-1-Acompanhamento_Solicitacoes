from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Disciplina
from ..serializers.disciplina_serializer import DisciplinaSerializer

class DisciplinaListCreateView(generics.ListCreateAPIView):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]

class DisciplinaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]
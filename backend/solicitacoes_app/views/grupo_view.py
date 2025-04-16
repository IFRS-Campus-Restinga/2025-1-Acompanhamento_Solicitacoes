from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.grupo_serializer import GrupoSerializer
from django.contrib.auth.models import Group

class GrupoListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar grupos.
    """
    queryset = Group.objects.all()
    serializer_class = GrupoSerializer
    permission_classes = [AllowAny]

class GrupoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar e deletar um grupo específico.
    """
    queryset = Group.objects.all()
    serializer_class = GrupoSerializer
    permission_classes = [AllowAny]


from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from ..serializers.coordenador_serializer import CoordenadorSerializer
from solicitacoes_app.models import Coordenador
from django.db import transaction
from rest_framework.response import Response


class CoordenadorListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar coordenadores.
    """
    
    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer
    permission_classes = [AllowAny]


class CoordenadorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um coordenador específico.
    """
    
    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer
    permission_classes = [AllowAny]

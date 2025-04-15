from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.usuario_serializer import UsuarioSerializer
from solicitacoes_app.models import Usuario


class UsuarioListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar usuarios.
    """
    
    queryset = Usuario.objects.filter(is_superuser=False)
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class UsuarioRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um usuario específico.
    """
    
    queryset = Usuario.objects.filter(is_superuser=False)
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

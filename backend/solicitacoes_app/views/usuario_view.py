from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.usuario_serializer import UsuarioSerializer
from solicitacoes_app.models import Usuario
from rest_framework.response import Response


class UsuarioListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar usuarios.
    """
    
    queryset = Usuario.objects.ativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class UsuarioRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um usuario específico.
    """
    
    queryset = Usuario.objects.ativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class UsuariosInativosView(generics.ListAPIView):
    """
    Endpoint para listar usuários inativos.
    """
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        # Utiliza o método 'inativos' que foi definido no Manager
        return Usuario.objects.inativos()
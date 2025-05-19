from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ..serializers.usuario_serializer import UsuarioSerializerComPapeis, UsuarioSerializer
from solicitacoes_app.models import Usuario, StatusUsuario


class UsuarioListCreateView(generics.ListCreateAPIView):

    """
    Endpoint para listar e criar usuarios.
    """

    queryset = Usuario.objects.ativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializerComPapeis
    permission_classes = [AllowAny]

class UsuarioRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):

    """
    Endpoint para recuperar, atualizar e deletar um usuario específico.
    """

    queryset = Usuario.objects.filter(is_superuser=False)
    serializer_class = UsuarioSerializerComPapeis
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs): #para update de usuarios inativos e reativação
        instance = self.get_object()
        serializer= self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            if instance.status_usuario == StatusUsuario.INATIVO or instance.is_active == False:
                instance.status_usuario = StatusUsuario.ATIVO
                instance.is_active = True
                instance.save()
            return Response(serializer.data)  # Retorna os dados atualizados com status 200
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsuariosInativosView(generics.ListAPIView):
    """
    Endpoint para listar usuários inativos.
    """
    queryset = Usuario.objects.inativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializerComPapeis
    permission_classes = [AllowAny]
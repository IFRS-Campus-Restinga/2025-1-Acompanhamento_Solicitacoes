from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import generics, serializers 
from ..serializers.usuario_serializer import UsuarioSerializerComGrupos, UsuarioSerializer
from solicitacoes_app.models import Usuario, StatusUsuario
from django.db.models import Q


class UsuarioListCreateView(generics.ListCreateAPIView):

    """
    Endpoint para listar e criar usuarios.
    """

    queryset = Usuario.objects.ativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializerComGrupos
    permission_classes = [AllowAny]

class UsuarioRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):

    """
    Endpoint para recuperar, atualizar e deletar um usuario específico.
    """

    queryset = Usuario.objects.filter(is_superuser=False)
    serializer_class = UsuarioSerializerComGrupos
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
    serializer_class = UsuarioSerializerComGrupos
    permission_classes = [AllowAny]
    
    
class UsuarioReativarView(generics.GenericAPIView):
    """
    Endpoint para reativar um usuário inativo.
    Aceita requisições PATCH para a URL /usuarios/inativos/{id}
    """
    queryset = Usuario.objects.inativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializerComGrupos
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        try:
            usuario = self.get_object()
        except Usuario.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        # Reativa o usuário
        usuario.is_active = True
        usuario.status_usuario = StatusUsuario.ATIVO
        usuario.save(update_fields=['is_active', 'status_usuario'])

        serializer = UsuarioSerializerComGrupos(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class UsuarioAprovarCadastroView(generics.GenericAPIView):
    """
    Endpoint para aprovar o cadastro de Usuários com status_usuario em aprovação
    Aceita requisições PATCH para a URL /usuarios/{id}
    """
    queryset = Usuario.objects.ativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializerComGrupos
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        try:
            usuario = self.get_object()
        except Usuario.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        # Aprova o cadastro do usuario
        usuario.is_active = True
        usuario.status_usuario = StatusUsuario.NOVO
        usuario.save(update_fields=['is_active', 'status_usuario'])

        serializer = UsuarioSerializerComGrupos(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class AlunoEmailListView(generics.ListAPIView):
    """
    Endpoint para listar apenas e-mails de alunos (para dropdown de responsáveis).
    """
    queryset = Usuario.objects.filter(Q(aluno__isnull=False)).only('email')
    serializer_class = serializers.Serializer  # Serializer básico
    permission_classes = [AllowAny]

    def list(self, request):
        emails = self.queryset.values_list('email', flat=True)
        return Response(list(emails))
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import generics, serializers 
from ..serializers.usuario_serializer import UsuarioSerializer
from solicitacoes_app.models import Usuario, StatusUsuario
from django.db.models import Q
from django.contrib.auth.models import Group

from ..serializers.usuario_serializer import UsuarioSerializerComGrupos #para view nova de solicitacoes
from django.http import Http404

class UsuarioListCreateView(generics.ListCreateAPIView):

    """
    Endpoint para listar e criar usuarios.
    """

    queryset = Usuario.objects.ativos().filter(is_superuser=False)
    serializer_class = UsuarioSerializerComGrupos
    permission_classes = [AllowAny]
    
    
    def perform_create(self, serializer):
        
        """
        Sobrescreve perform_create para adicionar o usuario ao grupo externo pós-criação
        """
     
        # serializer.save() chama o Usuario.save() e salva instância do usuário
        usuario_instance = serializer.save()

        # verifica se algum papel específico foi associado
        usuario_instance.refresh_from_db()
        has_group = False

        if hasattr(usuario_instance, 'aluno') and usuario_instance.aluno is not None:
            has_group = True
        elif hasattr(usuario_instance, 'coordenador') and usuario_instance.coordenador is not None:
            has_group = True
        elif hasattr(usuario_instance, 'cre') and usuario_instance.cre is not None:
            has_group = True
        elif hasattr(usuario_instance, 'responsavel') and usuario_instance.responsavel is not None:
            has_group = True
       
        if not has_group:
            try:
                grupo_externo = Group.objects.get(name='externo')
                usuario_instance.groups.add(grupo_externo)
                print(f"Usuário {usuario_instance.email} adicionado ao grupo 'externo'.")
            except Group.DoesNotExist:
                print("ERRO CRÍTICO: Grupo 'externo' não encontrado no banco de dados. Não foi possível associar o usuário.")
            except Exception as e:
                print(f"Erro inesperado ao adicionar usuário {usuario_instance.email} ao grupo 'externo': {e}")
        
    
    
    
    

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

        
        #Identifica o grupo e adiciona o usuário a ele
        nome_grupo = None
        if hasattr(usuario, "coordenador"):
            nome_grupo = "coordenador"
        elif hasattr(usuario, "cre"):
            nome_grupo = "cre"
        elif hasattr(usuario, "responsavel"):
            nome_grupo = "responsavel"

        if nome_grupo:
            try:
                grupo = Group.objects.get(name=nome_grupo)
                usuario.groups.add(grupo)
                print(f"Usuário {usuario.email} adicionado ao grupo '{nome_grupo}'.")
            except Group.DoesNotExist:
                print(f"ERRO: Grupo '{nome_grupo}' não encontrado.")
            except Exception as e:
                print(f"Erro ao adicionar usuário {usuario.email} ao grupo '{nome_grupo}': {e}")
        else:
             print(f"AVISO: Usuário {usuario.email} aprovado (status NOVO), mas nenhum grupo encontrado para associação.")

        # Logar a aprovação
        # LogEntry.log_action(request.user, usuario, "APPROVE", f"Cadastro de {nome_grupo or 'usuário'} aprovado (status NOVO).")
 
        serializer = UsuarioSerializerComGrupos(usuario)
        response_data = {
            "detail": "Cadastro aprovado com sucesso. Usuário agora tem status NOVO e foi adicionado ao grupo correspondente.",
            "usuario": serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)


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
    
 #Adicionado por Clarke ❤ para puxar e-mail e assim dar certo as informações de usuario
class UsuarioDetailByEmail(generics.RetrieveAPIView):
    """
    Endpoint para recuperar detalhes de um Usuario pelo email.
    Se o Usuario for um Aluno, incluirá os detalhes do Aluno.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializerComGrupos # Este é o serializer que contém a lógica de grupo_detalhes
    permission_classes = [AllowAny]
    lookup_field = 'email' # ESSENCIAL: define que a busca será pelo campo 'email'

    def get_object(self):
        # self.kwargs contém os argumentos da URL, incluindo 'email'
        email_buscado = self.kwargs.get('email')
        print(f"DEBUG: UsuarioDetailByEmail - Recebida requisição para o e-mail: {email_buscado}")

        if not email_buscado:
            print("DEBUG: E-mail não fornecido na URL.")
            raise Http404("E-mail não fornecido.") # Importar Http404 de django.http

        try:
            # Esta linha usa o lookup_field para buscar o objeto
            obj = super().get_object() 
            print(f"DEBUG: UsuarioDetailByEmail - Usuário ENCONTRADO no banco de dados: ID={obj.id}, Nome='{obj.nome}', Email='{obj.email}'")

            # Verifique se o objeto encontrado é um aluno (o serializer fará isso, mas podemos pré-verificar)
            if hasattr(obj, 'aluno') and obj.aluno is not None:
                print(f"DEBUG: UsuarioDetailByEmail - O usuário {obj.email} TEM um objeto Aluno associado.")
            else:
                print(f"DEBUG: UsuarioDetailByEmail - O usuário {obj.email} NÃO tem um objeto Aluno associado (ou 'aluno' é None).")
            
            return obj
        except Usuario.DoesNotExist:
            print(f"DEBUG: UsuarioDetailByEmail - Usuário com o e-mail '{email_buscado}' NÃO encontrado no banco de dados.")
            raise # Re-levanta a exceção 404 para o DRF
        except Exception as e:
            print(f"DEBUG: UsuarioDetailByEmail - Erro inesperado ao buscar usuário: {e}")
            raise # Re-levanta outras exceções
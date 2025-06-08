from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction
from ..models import Aluno, Usuario
from ..serializers.aluno_serializer import AlunoSerializer, AlunoWriteSerializer, AlunoSerializerAntigo, AlunoReadSerializer

#podem mexer
class AlunoListView(generics.ListAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializerAntigo
    permission_classes = [AllowAny]
    
#podem mexer
class AlunoRetrieveView(generics.RetrieveAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializerAntigo
    permission_classes = [AllowAny]

#DO NOT TOUCH IT!
class AlunoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e criar Alunos.
    GET: Lista todos os alunos (usa AlunoReadSerializer)
    POST: Cria um novo aluno (usa AlunoWriteSerializer)
    """
    queryset = Aluno.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        """
        Retorna o serializer apropriado com base no método HTTP.
        """
        if self.request.method == 'POST':
            return AlunoWriteSerializer
        return AlunoReadSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Cria um Usuario e um Aluno em uma única transação atômica.
        Toda a lógica de criação está centralizada aqui, não no serializer.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        try:
            # Extrair dados do usuário
            usuario_data = validated_data.pop('usuario')
            print(">>> usuario_data")
            print(usuario_data)
            
            # Criar o usuário
            usuario = Usuario.objects.create(**usuario_data)
            
            # Criar o aluno
            aluno = Aluno.objects.create(
                usuario=usuario,
                matricula=validated_data.get('matricula'),
                ppc=validated_data.get('ppc'),
                ano_ingresso=validated_data.get('ano_ingresso')
            )
            
            # Serializar a resposta usando o serializer de leitura
            read_serializer = AlunoReadSerializer(aluno)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Em caso de erro, a transação será revertida automaticamente
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#DO NOT TOUCH IT!
class AlunoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para recuperar, atualizar e excluir Alunos.
    GET: Usa AlunoReadSerializer
    PUT/PATCH: Usa AlunoWriteSerializer
    """
    queryset = Aluno.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AlunoWriteSerializer
        return AlunoReadSerializer

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        # Usa o serializer de leitura para responder
        read_serializer = AlunoReadSerializer(instance)
        return Response(read_serializer.data, status=status.HTTP_200_OK)

class AlunoBuscarPorCpfView(APIView):
    """
    Endpoint para buscar um aluno pelo CPF do usuário associado.
    Retorna o nome do aluno se encontrado.
    """
    permission_classes = [AllowAny] # Defina suas permissões aqui, se necessário

    def get(self, request, *args, **kwargs):
        cpf = request.query_params.get('cpf', None) # Pega o CPF dos parâmetros da URL (ex: ?cpf=12345678900)

        if not cpf:
            return Response({"detail": "CPF é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Busca o Aluno cujo usuário associado tem o CPF fornecido
            # Assumimos que o Aluno tem uma OneToOneField ou ForeignKey para Usuario
            # e que o campo 'cpf' está no modelo Usuario.
            aluno = Aluno.objects.get(usuario__cpf=cpf)
            # Retorna o nome do usuário associado ao aluno
            return Response({"nome_aluno": aluno.usuario.nome}, status=status.HTTP_200_OK)
        except Aluno.DoesNotExist:
            # Se nenhum aluno com esse CPF for encontrado
            return Response({"detail": "Aluno com o CPF fornecido não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Para capturar outros erros inesperados (ex: problema de banco de dados)
            return Response({"detail": f"Erro interno do servidor: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
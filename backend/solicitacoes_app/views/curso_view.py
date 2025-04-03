from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from ..models import Curso, Ppc
from ..serializers.curso_serializer import CursoSerializer

class CursoListCreateView(generics.ListCreateAPIView):
    """
    View para listar todos os cursos (GET) e cadastrar um novo curso (POST).
    Utiliza a view genérica ListCreateAPIView do DRF.
    """
    queryset = Curso.objects.all()  # Define a queryset base
    serializer_class = CursoSerializer  # Define o serializer que será usado
    permission_classes = [AllowAny]  # Permite acesso público (sem autenticação)

    def create(self, request, *args, **kwargs):
        """
        Sobrescreve o método create para adicionar lógica de vinculação
        de PPCs ao curso recém-criado.
        """
        data = request.data
        ppcs = data.get('ppcs', [])  # Lista de códigos de PPCs passados no corpo da requisição

        serializer = self.get_serializer(data=data)

        # Verifica se os dados são válidos
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Salva o curso
        curso = serializer.save()

        # Para cada código de PPC fornecido, associa o PPC ao curso criado
        for ppc_codigo in ppcs:
            try:
                ppc = Ppc.objects.get(codigo=ppc_codigo)
                ppc.curso = curso
                ppc.save()
            except Ppc.DoesNotExist:
                # Se algum PPC não for encontrado, retorna erro
                return Response({'message': f'PPC {ppc_codigo} não encontrado'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Curso cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)


class CursoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para obter (GET), atualizar (PUT/PATCH) ou deletar (DELETE) um curso específico.
    Utiliza RetrieveUpdateDestroyAPIView que encapsula essas 3 operações para um único recurso.
    
    - GET retorna os dados do curso identificado por 'codigo'.
    - PUT/PATCH atualiza os campos fornecidos.
    - DELETE remove o curso do banco de dados.
    """
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = [AllowAny]
    lookup_field = 'codigo'  # Define que a busca será feita pelo campo 'codigo' ao invés do ID padrão


from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from ..models import Curso, Ppc
from ..serializers.curso_serializer import CursoSerializer,  CursoListSerializer
from ..permissoes import IsCREForManagement


class CursoListCreateView(generics.ListCreateAPIView):
    """
    View para listar todos os cursos (GET) e cadastrar um novo curso (POST).
    Utiliza a view genérica ListCreateAPIView do DRF.
    """

    queryset = Curso.objects.all()  # Define a queryset base
    permission_classes = [IsAuthenticated, IsCREForManagement]  # Apenas CRE autenticado pode gerenciar cursos

    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.request.method == 'GET':
            return CursoListSerializer  # Serializer simplificado para listagem
        return CursoSerializer  # Serializer completo para criação

    def create(self, request, *args, **kwargs):
        """
        Sobrescreve o método create para adicionar lógica de vinculação
        de PPCs ao curso recém-criado.
        """
        data = request.data
        ppcs = data.get("ppcs", [])  # Lista de códigos de PPCs passados no corpo da requisição

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
                return Response(
                    {"message": f"PPC {ppc_codigo} não encontrado"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response({
            "message": "Curso cadastrado com sucesso!",
            "curso": CursoSerializer(curso).data
        }, status=status.HTTP_201_CREATED)


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
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE autenticado pode gerenciar cursos
    lookup_field = "codigo"  # Define que a busca será feita pelo campo 'codigo' ao invés do ID padrão


class CursoListPublicView(generics.ListAPIView):
    """
    View pública para listar cursos (sem autenticação).
    Útil para formulários públicos como desistência de vaga.
    """
    queryset = Curso.objects.all()
    serializer_class = CursoListSerializer
    permission_classes = [AllowAny]  # Permite acesso sem autenticação
    
    def get_queryset(self):
        """Permite filtrar por tipo de curso se necessário"""
        queryset = Curso.objects.all()
        tipo_curso = self.request.query_params.get('tipo_curso', None)
        
        if tipo_curso is not None:
            queryset = queryset.filter(tipo_curso=tipo_curso)
            
        return queryset.order_by('nome')

from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Ppc
from ..serializers.ppc_serializer import PpcSerializer

class PpcListCreateView(generics.ListCreateAPIView):
    """
    View para listar todos os PPCs (GET) e cadastrar um novo PPC (POST).
    Não precisa de lógica extra pois a criação de PPC é direta.
    """
    queryset = Ppc.objects.all()
    serializer_class = PpcSerializer
    permission_classes = [AllowAny]


class PpcRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para obter (GET), atualizar (PUT/PATCH) ou deletar (DELETE) um PPC específico.
    Semelhante à view de Curso, mas focada no modelo PPC.

    - GET retorna os dados de um PPC pelo código.
    - PUT/PATCH atualiza os campos fornecidos.
    - DELETE remove o PPC do banco de dados.
    """
    queryset = Ppc.objects.all()
    serializer_class = PpcSerializer
    permission_classes = [AllowAny]
    lookup_field = 'codigo'  # Utiliza 'codigo' ao invés do ID padrão

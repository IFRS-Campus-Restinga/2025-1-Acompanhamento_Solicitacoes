from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from ...models import MotivoAbono
from ...serializers.campos_solic_serializers.motivo_abono_serializer import MotivoAbonoSerializer
from ...permissoes import IsCREForManagement


class MotivoAbonoListCreateView(generics.ListCreateAPIView):
    """
    Para listar e criar motivo de abono de faltas.
    """
    queryset = MotivoAbono.objects.order_by("tipo_falta", "descricao")
    serializer_class = MotivoAbonoSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement]



class MotivoAbonoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Para recuperar, atualizar e deletar um motivo de abono de faltas.
    """
    queryset = MotivoAbono.objects.all()
    serializer_class = MotivoAbonoSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement]



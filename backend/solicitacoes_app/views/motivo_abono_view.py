from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import MotivoAbono
from ..serializers.motivo_abono_serializer import MotivoAbonoSerializer
from ..permissoes import CanManageMotivos, IsCRE


class MotivoAbonoListCreateView(generics.ListCreateAPIView):
    """
    Para listar e criar motivo de abono de faltas.
    """
    queryset = MotivoAbono.objects.order_by('tipo_falta', 'descricao')
    serializer_class = MotivoAbonoSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanManageMotivos]



class MotivoAbonoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Para recuperar, atualizar e deletar um motivo de abono de faltas.
    """
    queryset = MotivoAbono.objects.all()
    serializer_class = MotivoAbonoSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanManageMotivos]

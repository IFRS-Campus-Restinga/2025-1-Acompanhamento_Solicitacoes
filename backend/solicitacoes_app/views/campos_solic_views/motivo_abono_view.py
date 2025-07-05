from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from ...models import MotivoAbono
from ...serializers.campos_solic_serializers.motivo_abono_serializer import MotivoAbonoSerializer
from ...permissoes import CanManageMotivos, IsCRE
from rest_framework.permissions import BasePermission


class ReadOnly(BasePermission):
    """
    Permissão personalizada que permite acesso somente leitura.
    """
    def has_permission(self, request, view):
        return request.method in ['GET', 'HEAD', 'OPTIONS']


class MotivoAbonoListCreateView(generics.ListCreateAPIView):
    """
    Para listar e criar motivo de abono de faltas.
    GET: Permite acesso público para listar motivos
    POST: Requer permissão CanManageMotivos para criar motivos
    """
    queryset = MotivoAbono.objects.order_by('tipo_falta', 'descricao')
    serializer_class = MotivoAbonoSerializer
    
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - POST: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]


class MotivoAbonoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Para recuperar, atualizar e deletar um motivo de abono de faltas.
    GET: Permite acesso público para visualizar motivo específico
    PUT/PATCH/DELETE: Requer permissão CanManageMotivos
    """
    queryset = MotivoAbono.objects.all()
    serializer_class = MotivoAbonoSerializer
    
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - PUT/PATCH/DELETE: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]



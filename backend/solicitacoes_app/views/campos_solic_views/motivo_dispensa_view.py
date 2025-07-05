from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from ...models.campos_solic_models.motivo_dispensa import MotivoDispensa
from ...serializers.campos_solic_serializers.motivo_dispensa_serializer import MotivoDispensaSerializer
from ...permissoes import CanManageMotivos, IsCRE


class MotivoDispensaListService(generics.ListCreateAPIView): 
    """
    Service que retorna todos os motivos cadastrados, além de permitir cadastrar um novo
    GET: Permite acesso público para listar motivos
    POST: Requer permissão CanManageMotivos para criar motivos
    """
    serializer_class = MotivoDispensaSerializer
    queryset = MotivoDispensa.objects.all()
    
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - POST: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]


class MotivoDispensaService(generics.RetrieveUpdateDestroyAPIView):  
    """
    Service que realiza as operações de Deletar ou atualizar um motivo de dispensa
    GET: Permite acesso público para visualizar motivo específico
    PUT/PATCH/DELETE: Requer permissão CanManageMotivos
    """
    serializer_class = MotivoDispensaSerializer
    queryset = MotivoDispensa.objects.all()
    
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - PUT/PATCH/DELETE: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]

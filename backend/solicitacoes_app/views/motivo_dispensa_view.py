from rest_framework import generics
from ..models.motivo_dispensa import MotivoDispensa
from ..serializers.motivo_dispensa_serializer import MotivoDispensaSerializer
from rest_framework.permissions import AllowAny
from ..permissoes import CanManageMotivos, IsCRE


class MotivoDispensaListService(generics.ListCreateAPIView): 
    """
    Service que retorna todos os motivos cadastrados, além de permitir cadastrar um novo
    """
    serializer_class = MotivoDispensaSerializer
    queryset = MotivoDispensa.objects.all()
    #permission_classes = [AllowAny]
    permission_classes = [CanManageMotivos]



class MotivoDispensaService(generics.RetrieveUpdateDestroyAPIView):  
    """
    Service que realiza as operações de Deletar ou atualizar um motivo de dispensa
    """
    serializer_class = MotivoDispensaSerializer
    queryset = MotivoDispensa.objects.all()
    #permission_classes = [AllowAny]
    permission_classes = [CanManageMotivos]


        
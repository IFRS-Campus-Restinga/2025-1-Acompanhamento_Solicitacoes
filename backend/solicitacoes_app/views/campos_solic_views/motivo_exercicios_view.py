from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from ...models.campos_solic_models.motivo_exercicios import MotivoExercicios   
from ...serializers.campos_solic_serializers.motivo_exercicios_serializer import MotivoExerciciosSerializer
from ...permissoes import CanManageMotivos


class MotivoExerciciosListCreateView(generics.ListCreateAPIView):
    """
    Para listar e criar motivo de exercícios domiciliares.
    GET: Permite acesso público para listar motivos
    POST: Requer permissão CanManageMotivos para criar motivos
    """
    queryset = MotivoExercicios.objects.all()
    serializer_class = MotivoExerciciosSerializer
    
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - POST: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]


class MotivoExerciciosRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Para recuperar, atualizar e deletar um motivo de exercícios domiciliares.
    GET: Permite acesso público para visualizar motivo específico
    PUT/PATCH/DELETE: Requer permissão CanManageMotivos
    """
    queryset = MotivoExercicios.objects.all()
    serializer_class = MotivoExerciciosSerializer
    
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - PUT/PATCH/DELETE: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]

from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_200_OK

from ...models.campos_solic_models.atividade_complementar import AtividadeComplementar
from ...serializers.campos_solic_serializers.atividade_complementar_serializer import AtividadeComplementarSerializer
from ...permissoes import CanManageMotivos, IsCRE

class AtividadeComplementarListCreateView(generics.ListCreateAPIView):
    """
    Para listar e criar atividades complementares.
    """
    queryset = AtividadeComplementar.objects.all().order_by('nome', 'carga_horaria')
    serializer_class = AtividadeComplementarSerializer

    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - POST: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'message': "Atividade complementar cadastrada com sucesso!"}, status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class AtividadeComplementarRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Para recuperar, atualizar e deletar uma atividade complementar.
    """
    queryset = AtividadeComplementar.objects.all()
    serializer_class = AtividadeComplementarSerializer

    def get_permissions(self):
        """
        Define permissões diferentes para diferentes métodos:
        - GET: AllowAny (permite acesso público)
        - PUT/PATCH/DELETE: CanManageMotivos (requer permissão específica)
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [CanManageMotivos()]

    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': "Atividade complementar atualizada com sucesso!"}, status=HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': "Atividade complementar excluída com sucesso!"}, status=HTTP_200_OK)



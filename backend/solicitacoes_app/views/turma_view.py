from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST
)

from ..models import Turma
from ..serializers.turma_serializer import TurmaSerializer


class TurmaListCreateView(generics.ListCreateAPIView):
    """
    View para listar (GET) e criar (POST) turmas.
    """
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Turma cadastrada com sucesso!'}, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class TurmaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para obter (GET), atualizar (PUT/PATCH) e deletar (DELETE) uma turma pelo ID.
    """
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'  # Como só tem nome, usaremos o id (padrão do model)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Turma atualizada com sucesso!'}, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Turma removida com sucesso!'}, status=HTTP_200_OK)
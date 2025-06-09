from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
)

from ..models import Responsavel
# >>> AQUI ESTÁ A MUDANÇA ESSENCIAL NO IMPORT <<<
# Precisamos importar os novos nomes dos serializers que criamos
from ..serializers.responsavel_serializer import ResponsavelListSerializer, ResponsavelCreateUpdateSerializer


class ResponsavelListCreateView(generics.ListCreateAPIView):
    queryset = Responsavel.objects.all()
    # Para as requisições GET (listagem de responsáveis), usamos o ResponsavelListSerializer
    serializer_class = ResponsavelListSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Para as requisições POST (criação de responsável), usamos o ResponsavelCreateUpdateSerializer
        serializer = ResponsavelCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'message': 'Responsável cadastrado com sucesso!'}, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class ResponsavelRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Responsavel.objects.all()
    # Definimos o serializer padrão para a view. 
    # ResponsavelCreateUpdateSerializer é bom para operações de update.
    serializer_class = ResponsavelCreateUpdateSerializer 
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ao recuperar um único responsável (GET de um ID específico), 
        # é melhor usar o ResponsavelListSerializer para ter os detalhes aninhados (depth=1)
        serializer = ResponsavelListSerializer(instance) 
        return Response(serializer.data, status=HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # O serializer para o update será o definido em serializer_class (ResponsavelCreateUpdateSerializer)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Responsável atualizado com sucesso!'}, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Responsável deletado com sucesso!'}, status=HTTP_200_OK)

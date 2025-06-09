from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
)

from ..models import Responsavel
# Importar os serializers ajustados
from ..serializers.responsavel_serializer import ResponsavelListSerializer, ResponsavelCreateUpdateSerializer


class ResponsavelListCreateView(generics.ListCreateAPIView):
    queryset = Responsavel.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        """
        Usa ResponsavelCreateUpdateSerializer para POST (criação)
        e ResponsavelListSerializer para GET (listagem).
        """
        if self.request.method == 'POST':
            return ResponsavelCreateUpdateSerializer
        return ResponsavelListSerializer
    
    def perform_create(self, serializer):
        """
        Chama o método create do serializer para criar o Responsavel
        e o Usuario/vincular, e adicionar ao grupo.
        """
        serializer.save() # O serializer.create() já faz tudo o que precisamos


class ResponsavelRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Responsavel.objects.all()
    # Definimos o serializer padrão para a view de update/destroy.
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

from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
)
from django.db import transaction # Importar transaction

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
            return ResponsavelCreateUpdateSerializer # Usamos o serializer de escrita para receber os dados
        return ResponsavelListSerializer # Usamos o serializer de leitura para listar

    @transaction.atomic # Adiciona a transação atômica aqui
    def create(self, request, *args, **kwargs):
        """
        Cria um Responsável (e seu Usuario associado, se for o caso) em uma única transação atômica.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Lança exceção se não for válido

        try:
            # Chama o método create do serializer, que agora cria Usuario e Responsavel
            responsavel_instance = serializer.save() 
            
            # Serializa a resposta usando o ResponsavelListSerializer para incluir o usuario aninhado
            read_serializer = ResponsavelListSerializer(responsavel_instance)
            return Response(read_serializer.data, status=HTTP_201_CREATED)
        except Exception as e:
            # Em caso de erro, a transação será revertida automaticamente
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResponsavelRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Responsavel.objects.all()
    # Definimos o serializer padrão para a view de update/destroy.
    serializer_class = ResponsavelCreateUpdateSerializer 
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ao recuperar um único responsável (GET de um ID específico), 
        # é melhor usar o ResponsavelListSerializer para ter os detalhes aninhados (depth=1)
        serializer = ResponsavelListSerializer(instance) 
        return Response(serializer.data, status=HTTP_200_OK)

    @transaction.atomic # Adiciona a transação atômica aqui
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_update(serializer)
            read_serializer = ResponsavelListSerializer(instance) # Usa a instância original que foi atualizada
            return Response(read_serializer.data, status=HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=HTTP_500_INTERNAL_SERVER_ERROR
            )


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Responsável deletado com sucesso!'}, status=HTTP_200_OK)

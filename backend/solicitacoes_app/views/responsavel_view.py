from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
)
from django.db import transaction 
from ..models import Responsavel
from ..serializers.responsavel_serializer import ResponsavelReadSerializer, ResponsavelWriteSerializer
from ..permissoes import IsCREForManagement


class ResponsavelListCreateView(generics.ListCreateAPIView):
    
    queryset = Responsavel.objects.all()
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode listar e criar responsáveis

    def get_serializer_class(self):
    
        if self.request.method == 'POST':
            return ResponsavelWriteSerializer 
        return ResponsavelReadSerializer

    
    
    @transaction.atomic 
    def create(self, request, *args, **kwargs):
        """
        Cria um novo Responsavel
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            responsavel = serializer.save()
            
            read_serializer = ResponsavelReadSerializer(responsavel)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResponsavelRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Responsavel.objects.all()
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode gerenciar responsáveis

    def get_serializer_class(self):
        
        if self.request.method in ['PUT', 'PATCH']:
            return ResponsavelWriteSerializer
        return ResponsavelReadSerializer

    @transaction.atomic 
    def update(self, request, *args, **kwargs):
        
        partial = kwargs.pop('partial', False) 
        instance = self.get_object() 
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True) # Valida os dados, levanta exceção se inválido

        self.perform_update(serializer)
        read_serializer = ResponsavelReadSerializer(instance)
        return Response(read_serializer.data, status=status.HTTP_200_OK)



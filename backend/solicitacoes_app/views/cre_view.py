from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.cre_serializer import CREReadSerializer, CREWriteSerializer
from solicitacoes_app.models import Usuario, CRE
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response


class CREListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar CREs.
    """
    
    queryset = CRE.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        """
        Retorna o serializer apropriado com base no método HTTP.
        """
        if self.request.method == 'POST':
            return CREWriteSerializer
        return CREReadSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Cria um Usuario e uma CRE em uma única transação atômica.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        try:
            # Extrair dados do usuário
            usuario_data = validated_data.pop('usuario')
            
            # Criar o usuário
            usuario = Usuario.objects.create(**usuario_data)
            
            # Criar a CRE
            cre = CRE.objects.create(
                usuario=usuario,
                siape=validated_data.get('siape')
            )
            
            # Serializar a resposta usando o serializer de leitura
            read_serializer = CREReadSerializer(cre)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Em caso de erro, a transação será revertida automaticamente
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

class CRERetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar uma CRE.
    """
    
    queryset = CRE.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CREWriteSerializer
        return CREReadSerializer

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        # Usa o serializer de leitura para responder
        read_serializer = CREReadSerializer(instance)
        return Response(read_serializer.data, status=status.HTTP_200_OK)
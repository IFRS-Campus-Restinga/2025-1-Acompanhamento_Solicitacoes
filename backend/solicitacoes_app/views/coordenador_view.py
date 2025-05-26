from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from ..serializers.coordenador_serializer import *
from ..serializers.usuario_serializer import UsuarioSerializer
from solicitacoes_app.models import Coordenador
from django.db import transaction
from rest_framework.response import Response


    
class CoordenadorListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar coordenadores.
    """
    
    queryset = Coordenador.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        """
        Retorna o serializer apropriado com base no método HTTP.
        """
        if self.request.method == 'POST':
            return CoordenadorWriteSerializer
        return CoordenadorReadSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Cria um Usuario, um Coordenador e um Mandato em uma única transação atômica.
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
            
            # Criar o Coordenador
            coordenador = Coordenador.objects.create(
                usuario=usuario,
                siape=validated_data.get('siape')
            )
            
            # Criar o Mandato
            mandato = Mandato.objects.create(
                coordenador=coordenador,
                curso=validated_data.get('curso'),
                inicio_mandato=validated_data.get('inicio_mandato'),
                fim_mandato=validated_data.get('fim_mandato')
            )
            
            # Serializar a resposta usando o serializer de leitura
            read_serializer = CoordenadorReadSerializer(coordenador)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Em caso de erro, a transação será revertida automaticamente
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CoordenadorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um coordenador específico com seu mandato.
    """
    
    queryset = Coordenador.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CoordenadorWriteSerializer
        return CoordenadorReadSerializer

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # O serializer agora precisa da instância para o método update
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        read_serializer = CoordenadorReadSerializer(instance) # Usa a instância original que foi atualizada pelo perform_update
        return Response(read_serializer.data, status=status.HTTP_200_OK)

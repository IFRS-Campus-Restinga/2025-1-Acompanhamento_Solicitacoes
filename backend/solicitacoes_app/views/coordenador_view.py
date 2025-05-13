from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from ..serializers.coordenador_serializer import CoordenadorSerializer, CadastroCoordenadorMandatoSerializer
from ..serializers.usuario_serializer import UsuarioSerializer
from solicitacoes_app.models import Coordenador
from django.db import transaction
from rest_framework.response import Response


class CoordenadorListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar coordenadores.
    """
    
    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer
    permission_classes = [AllowAny]
    


class CoordenadorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um coordenador específico.
    """
    
    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer
    permission_classes = [AllowAny]

class CadastroCoordenadorMandatoView(generics.CreateAPIView):
    
    serializer_class = CadastroCoordenadorMandatoSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        print(*args)
        print(**kwargs)
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                instance = serializer.save()
                return Response(instance, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
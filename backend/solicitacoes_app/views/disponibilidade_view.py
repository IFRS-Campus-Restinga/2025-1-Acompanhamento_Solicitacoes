from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers.disponibilidade_serializer import DisponibilidadeSerializer
from ..models import Disponibilidade

class DisponibilidadeListCreateView(generics.ListCreateAPIView):
    queryset = Disponibilidade.objects.all()
    serializer_class = DisponibilidadeSerializer

class DisponibilidadeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Disponibilidade.objects.all()
    serializer_class = DisponibilidadeSerializer
    lookup_field = 'id'

class VerificarDisponibilidadeView(APIView):
    def get(self, request):
        formulario = request.query_params.get('formulario')
        if not formulario:
            return Response(
                {"error": "Parâmetro 'formulario' obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            disp = Disponibilidade.objects.get(formulario=formulario)
            return Response({
                "disponivel": disp.esta_ativo,
                "periodo": f"{disp.data_inicio} a {disp.data_fim}" if not disp.sempre_disponivel else "Sempre disponível"
            })
        except Disponibilidade.DoesNotExist:
            return Response({"disponivel": True, "periodo": "Sempre disponível"})
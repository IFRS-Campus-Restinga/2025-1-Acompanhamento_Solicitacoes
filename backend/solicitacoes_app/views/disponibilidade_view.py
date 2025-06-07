from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db import models

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
            disponibilidade = Disponibilidade.objects.get(formulario=formulario)
            periodos_ativos = disponibilidade.periodos.filter(
                data_inicio__lte=timezone.now().date(),
                data_fim__gte=timezone.now().date()
            ) | disponibilidade.periodos.filter(
                data_inicio__lte=timezone.now().date(),
                data_fim__isnull=True
            )

            disponivel = periodos_ativos.exists()
            periodos_formatados = [
                f"{p.data_inicio} a {p.data_fim}" if p.data_fim 
                else f"A partir de {p.data_inicio}"
                for p in periodos_ativos
            ]

            return Response({
                "disponivel": disponivel,
                "periodos": periodos_formatados if disponivel else ["Formulário indisponível"]
            })
        except Disponibilidade.DoesNotExist:
            return Response({
                "disponivel": True,
                "periodos": ["Sempre disponível (não registrado)"]
            })
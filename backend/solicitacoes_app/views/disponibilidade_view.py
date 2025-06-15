from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db import models

from ..serializers.disponibilidade_serializer import DisponibilidadeSerializer
from ..models import Disponibilidade, PeriodoDisponibilidade

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
            
            # PRIMEIRA VERIFICAÇÃO: O registro de disponibilidade está ativo no modelo (checkbox marcado)?
            if not disponibilidade.ativo:
                return Response({
                    "disponivel": False,
                    "periodos": ["Formulário desativado pelo administrador."]
                })

            # SEGUNDA VERIFICAÇÃO: Há períodos válidos para acesso AGORA?
            hoje = timezone.now().date()
            disponivel_por_periodo = False
            periodos_para_retornar = [] # Initialize here

            # Determine if it's "sempre_disponivel" based on your serializer's logic
            # (exactly one period and its data_fim is null)
            is_sempre_disponivel = (
                disponibilidade.periodos.count() == 1 and 
                disponibilidade.periodos.filter(data_fim__isnull=True).exists()
            )

            if is_sempre_disponivel:
                # If it's "sempre_disponivel", we only care about the start date of that single period
                periodo_unico = disponibilidade.periodos.filter(data_fim__isnull=True).first()
                if periodo_unico and periodo_unico.data_inicio <= hoje:
                    disponivel_por_periodo = True
                    periodos_para_retornar = [f"A partir de {periodo_unico.data_inicio.strftime('%d/%m/%Y')}"]
                else:
                    # If sempre_disponivel is set but the start date is in the future
                    if periodo_unico:
                         periodos_para_retornar = [f"Inicia em {periodo_unico.data_inicio.strftime('%d/%m/%Y')} (Sempre Disponível)"]
                    else:
                         periodos_para_retornar = ["Configurado como 'Sempre Disponível' mas sem período válido."]

            else:
                # If not "sempre_disponivel", check for specific date ranges
                # Find all periods that are currently active
                ativos_agora = PeriodoDisponibilidade.objects.filter(
                    disponibilidade=disponibilidade, # Ensure it belongs to this availability
                    data_inicio__lte=hoje,
                    data_fim__gte=hoje
                )
                
                if ativos_agora.exists():
                    disponivel_por_periodo = True
                    # Format active periods to return
                    periodos_para_retornar = [
                        f"{p.data_inicio.strftime('%d/%m/%Y')} a {p.data_fim.strftime('%d/%m/%Y')}"
                        for p in ativos_agora
                    ]
                else:
                    # If no periods are active, try to find upcoming periods for display
                    proximos_periodos = PeriodoDisponibilidade.objects.filter(
                        disponibilidade=disponibilidade,
                        data_inicio__gt=hoje
                    ).order_by('data_inicio')[:3] # Get up to 3 upcoming periods
                    
                    if proximos_periodos.exists():
                        periodos_para_retornar = [
                            f"Próximo período: {p.data_inicio.strftime('%d/%m/%Y')} a {p.data_fim.strftime('%d/%m/%Y')}" if p.data_fim
                            else f"Próximo período a partir de: {p.data_inicio.strftime('%d/%m/%Y')}"
                            for p in proximos_periodos
                        ]
                    else:
                        periodos_para_retornar = ["Não há períodos ativos ou futuros configurados."]
            
            # The final 'disponivel' status depends only on 'disponivel_por_periodo' at this point,
            # as 'disponibilidade.ativo' was checked earlier.
            disponivel = disponivel_por_periodo

            return Response({
                "disponivel": disponivel,
                "periodos": periodos_para_retornar
            })

        except Disponibilidade.DoesNotExist:
            # CORRECT: If no Disponibilidade object is found, it's not available.
            return Response({
                "disponivel": False,
                "periodos": ["Formulário não cadastrado."] # Clear message
            })
        except Exception as e:
            # Catch other unexpected errors
            print(f"Erro inesperado na VerificarDisponibilidadeView: {e}") # For server-side debugging
            return Response(
                {"error": f"Ocorreu um erro inesperado na verificação: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
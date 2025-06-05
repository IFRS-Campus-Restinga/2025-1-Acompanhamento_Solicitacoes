from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.mandato_serializer import MandatoSerializer, MandatoDetalhadoSerializer
from solicitacoes_app.models import Mandato, Curso
from django.db.models import Q, F, ExpressionWrapper, BooleanField
from django.utils import timezone


class MandatoListCreateView(generics.ListCreateAPIView):
    
    """
    Endpoint para listar e criar mandatos.
    """
    
    queryset = Mandato.objects.all()
    serializer_class = MandatoSerializer
    permission_classes = [AllowAny]
    

class MandatoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    
    """
    Endpoint para recuperar, atualizar e deletar um mandato específico.
    """
    
    queryset = Mandato.objects.all()
    serializer_class = MandatoSerializer
    permission_classes = [AllowAny]
    


class MandatoOrdenadoListView(generics.ListAPIView):
    """
    View para listar todos os Mandatos, com a seguinte ordenação:
    1. Mandatos vigentes (sem data fim OU com data fim >= hoje) primeiro, ordenados por nome do curso.
    2. Mandatos encerrados (com data fim < hoje) depois, ordenados por nome do curso e depois por data de início (mais recente primeiro).
    """
    serializer_class = MandatoDetalhadoSerializer

    def get_queryset(self):
        """
        Retorna um queryset de todos os Mandatos, com dados relacionados
        pré-buscados e ordenados conforme a lógica especificada.
        """
        today = timezone.now().date()
        queryset = Mandato.objects.select_related(
            "curso",
            "coordenador"
        ).annotate(
            # True se fim_mandato for NULL OU se fim_mandato >= hoje
            is_current=ExpressionWrapper(
                Q(fim_mandato__isnull=True) | Q(fim_mandato__gte=today),
                output_field=BooleanField()
            )
        ).order_by(
            "-is_current",      # Ordena por is_current DESC (True primeiro - vigentes)
            "curso__nome",      # Ordena ambos os grupos por nome do curso
            "-inicio_mandato"   # Ordena os encerrados do mesmo curso por data de início DESC
                                # (Também ordena os vigentes do mesmo curso)
        )
        return queryset
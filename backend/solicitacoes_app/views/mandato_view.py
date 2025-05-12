from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..serializers.curso_serializer import CursoComHistoricoMandatosSerializer
from ..serializers.coordenador_serializer import CoordenadorSerializer
from ..serializers.usuario_serializer import UsuarioSerializer
from ..serializers.mandato_serializer import MandatoSerializer
from solicitacoes_app.models import Mandato, Curso
from django.db.models import Prefetch


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
    
    
class HistoricoMandatosPorCursoView(generics.ListAPIView):
    serializer_class = CursoComHistoricoMandatosSerializer
    queryset = Curso.objects.all().prefetch_related(
        Prefetch(
            'mandatos_curso',
            queryset=Mandato.objects.all().order_by('-inicio_mandato').select_related('coordenador__usuario'),
            to_attr='historico_mandatos'
        )
    ).order_by('nome')

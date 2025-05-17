from rest_framework.generics import ListAPIView
from ..models import Usuario
from ..serializers.usuario_serializer import UsuarioSerializer# O seu UsuarioSerializer existente
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import Turma
from ..serializers.disciplina_serializer import DisciplinaSerializer # O novo DisciplinaSerializer
from rest_framework.decorators import api_view  
from django.shortcuts import get_object_or_404

class UsuarioPorEmailView(ListAPIView):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        email = self.request.query_params.get('email', None)
        if email is not None:
            return Usuario.objects.filter(email__iexact=email)
        return Usuario.objects.none() # Retorna vazio se não houver e-mail
        
class DisciplinasPorPPCView(ListAPIView):
    """
    Endpoint para listar disciplinas de um PPC específico.
    Utiliza a classe ListAPIView que é mais robusta.
    """
    serializer_class = DisciplinaSerializer

    def get_queryset(self):
        ppc_codigo = self.kwargs['ppc_codigo']
        return Disciplina.objects.filter(ppc__codigo=ppc_codigo).distinct()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            
            if not queryset.exists():
                return Response(
                    {"detail": "Nenhuma disciplina encontrada para este PPC."},
                    status=status.HTTP_200_OK
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
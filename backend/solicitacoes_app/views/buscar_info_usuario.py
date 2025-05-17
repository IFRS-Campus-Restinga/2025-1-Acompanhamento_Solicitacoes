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
        


class DisciplinasPorTurmaView(APIView):
    def get(self, request, turma_id, format=None):
        turma = get_object_or_404(Turma, pk=turma_id)
        disciplinas = turma.disciplinas.all()
        serializer = DisciplinaSerializer(disciplinas, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def disciplinas_por_ppc(request, ppc_codigo):
    """
    Endpoint para listar disciplinas de um PPC específico.
    """
    try:
        # Corrigindo a consulta - deve ser Disciplina.objects.filter
        disciplinas = Disciplina.objects.filter(ppc__codigo=ppc_codigo).distinct()
        
        if not disciplinas.exists():
            return Response(
                {"detail": "Nenhuma disciplina encontrada para este PPC."}, 
                status=status.HTTP_200_OK
            )
        
        # Usando o serializer para formatar a resposta
        serializer = DisciplinaSerializer(disciplinas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
 
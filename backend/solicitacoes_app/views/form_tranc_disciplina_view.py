from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models.form_tranc_disciplina import FormTrancDisciplina
from ..serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from ..models import Disciplina, Ppc

class FormTrancDisciplinaListCreate(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de trancamento de disciplinas.
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    permission_classes = [AllowAny]

class FormTrancDisciplinaDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário de trancamento de disciplinas específico.
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

@api_view(['GET'])
def disciplinas_por_curso(request, curso_codigo):
    """
    Endpoint para listar disciplinas de um curso específico.
    """
    try:
        # Filtrar as disciplinas com base no curso_codigo
        disciplinas = Disciplina.objects.filter(ppc__curso__codigo=curso_codigo).distinct()
        
        # Se não encontrar disciplinas, retornar uma lista vazia
        if not disciplinas:
            return Response({"disciplinas": []}, status=200)
        
        # Retornar disciplinas no formato que o frontend espera
        return Response({
            "disciplinas": [
                {"codigo": disciplina.codigo, "nome": disciplina.nome} for disciplina in disciplinas
            ]
        }, status=200)
    
    except Disciplina.DoesNotExist:
        return Response({"error": "Curso não encontrado ou sem disciplinas."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
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
    disciplinas = Disciplina.objects.filter(ppcs__curso__codigo=curso_codigo).distinct()
    return Response([
        {"codigo": disciplina.codigo, "nome": disciplina.nome} for disciplina in disciplinas
    ])
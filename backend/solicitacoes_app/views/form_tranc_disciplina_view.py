from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..models.form_tranc_disciplina import FormTrancDisciplina
from ..serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer

class FormTrancDisciplinaListCreate(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de trancamento de disciplinas.
    """
    queryset           = FormTrancDisciplina.objects.all()
    serializer_class   = FormTrancDisciplinaSerializer
    permission_classes = [AllowAny]  

class FormTrancDisciplinaDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário de trancamento de disciplinas específico.
    """
    queryset           = FormTrancDisciplina.objects.all()
    serializer_class   = FormTrancDisciplinaSerializer
    permission_classes = [AllowAny]
    lookup_field       = "id"  
from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..models.forms.form_exercicio_domiciliar import FormExercicioDomiciliar
from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer

class FormExercicioDomiciliarListCreate(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de solicitação de exercícios domiciliares.
    """
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [AllowAny]

class FormExercicioDomiciliarDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário de exercício domiciliar específico.
    """
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

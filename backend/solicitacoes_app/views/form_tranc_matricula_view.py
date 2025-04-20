from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..models import FormularioTrancamento
from ..serializers.form_tranc_matricula_serializar import (
    FormularioTrancamentoSerializer,
)

class FormTrancamentoListCreate(generics.ListCreateAPIView):
    queryset           = FormularioTrancamento.objects.all()
    serializer_class   = FormularioTrancamentoSerializer
    permission_classes = [AllowAny]


class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = FormularioTrancamento.objects.all()
    serializer_class   = FormularioTrancamentoSerializer
    permission_classes = [AllowAny]
    lookup_field       = "id"          # inteiro gerado automaticamente

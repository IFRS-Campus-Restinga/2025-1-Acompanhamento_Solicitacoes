from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..models.form_tranc_matricula import FormularioTrancamentoMatricula
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer

class FormTrancamentoListCreate(generics.ListCreateAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]

class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

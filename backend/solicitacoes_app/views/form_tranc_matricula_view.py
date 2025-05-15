from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import FormularioTrancamentoMatricula
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from datetime import datetime

class FormTrancamentoCreateWithSolicitacaoView(generics.ListCreateAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        print("🔥 request.data no backend:", self.request.data)
        serializer.save(
            data_solicitacao=datetime.now().date()  
        )


class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

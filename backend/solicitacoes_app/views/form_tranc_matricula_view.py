from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import FormularioTrancamentoMatricula, Solicitacao
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from datetime import datetime

class FormTrancamentoCreateWithSolicitacaoView(generics.ListCreateAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]


    def perform_create(self, serializer):
        print("🔥 request.data no backend:", self.request.data)
        aluno_id = self.request.data.get("aluno")

        if not aluno_id:
            raise ValueError(
                "Campo 'aluno_id' é obrigatório para criar a solicitação.")

        form = serializer.save()

        Solicitacao.objects.create(
            aluno_id=aluno_id,
            content_type=ContentType.objects.get_for_model(
                FormularioTrancamentoMatricula),
            object_id=form.id,
            data_solicitacao=datetime.now()
        )


class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

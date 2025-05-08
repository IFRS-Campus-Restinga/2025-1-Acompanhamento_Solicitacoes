from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import FormularioTrancamentoMatricula, Solicitacao
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from django.contrib.contenttypes.models import ContentType


class FormTrancamentoCreateWithSolicitacaoView(generics.ListCreateAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        print("REQUEST DATA:", self.request.data)
        form = serializer.save()
        Solicitacao.objects.create(
            aluno=form.aluno,
            content_type=ContentType.objects.get_for_model(
                FormularioTrancamentoMatricula),
            object_id=form.id
        )


class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

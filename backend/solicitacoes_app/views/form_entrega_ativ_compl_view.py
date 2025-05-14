from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from ..models.form_entrega_ativ_compl import FormEntregaAtivCompl
from ..serializers.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer
from ..models.solicitacao import Solicitacao
from django.contrib.contenttypes.models import ContentType
from datetime import datetime

class FormEntregaAtivComplListCreate(ListCreateAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
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
                FormEntregaAtivCompl),
            object_id=form.id,
            data_solicitacao=datetime.now()
        )


class FormEntregaAtivComplUpdate(RetrieveUpdateAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
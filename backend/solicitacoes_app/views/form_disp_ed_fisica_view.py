from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView
from rest_framework.permissions import AllowAny
from ..models.form_dispensa_ed_fisica import FormDispensaEdFisica
from ..serializers.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer
from ..models.solicitacao import Solicitacao
from django.contrib.contenttypes.models import ContentType
from datetime import datetime

class FormDispEdFisicaViewListCreate(ListCreateAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    permissions_classes = [AllowAny]

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
                FormDispensaEdFisica),
            object_id=form.id,
            data_solicitacao=datetime.now()
        )


class FormDispEdFisicaViewUpdateDelete(RetrieveDestroyAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    permissions_classes = [AllowAny]
    lookup_field = "id"
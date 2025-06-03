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


class FormEntregaAtivComplUpdate(RetrieveUpdateAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
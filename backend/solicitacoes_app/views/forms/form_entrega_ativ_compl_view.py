from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from ...models.forms.form_entrega_ativ_compl import FormEntregaAtivCompl
from ...serializers.forms.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer
from ...models.solicitacao import Solicitacao
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
from ...permissoes import CanSubmitEntregaAtivCompl, CanViewSolicitacaoDetail


class FormEntregaAtivComplListCreateView(ListCreateAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanSubmitEntregaAtivCompl]


class FormEntregaAtivComplRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanViewSolicitacaoDetail]
    lookup_field = "id"
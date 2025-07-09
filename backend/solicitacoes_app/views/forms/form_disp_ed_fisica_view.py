from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from ...models import FormDispensaEdFisica
from ...serializers.forms.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer
from ...models.solicitacao import Solicitacao
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
from ...permissoes import CanSubmitDispensaEdFisica, CanViewSolicitacaoDetail


class FormDispEdFisicaListCreateView(ListCreateAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    #permissions_classes = [AllowAny]
    permission_classes = [CanSubmitDispensaEdFisica]


class FormDispEdFisicaRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    #permissions_classes = [AllowAny]
    permission_classes = [CanViewSolicitacaoDetail] 
    lookup_field = "id"
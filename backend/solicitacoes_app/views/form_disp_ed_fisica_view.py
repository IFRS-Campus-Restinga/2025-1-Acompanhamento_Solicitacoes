from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView
from rest_framework.permissions import AllowAny
from ..models.form_dispensa_ed_fisica import FormDispensaEdFisica
from ..serializers.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer

class FormDispEdFisicaViewListCreate(ListCreateAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    permissions_classes = [AllowAny]


class FormDispEdFisicaViewUpdateDelete(RetrieveDestroyAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    permissions_classes = [AllowAny]
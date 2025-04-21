from rest_framework.serializers import Serializer
from ..models.form_dispensa_ed_fisica import FormDispensaEdFisica

class FormDispEdFisicaSerializer(Serializer):

    class Meta:
        fields = ["id", "motivo_dispensa"]
        model = FormDispensaEdFisica
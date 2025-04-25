from rest_framework.serializers import ModelSerializer
from ..models.form_dispensa_ed_fisica import FormDispensaEdFisica

class FormDispEdFisicaSerializer(ModelSerializer):

    class Meta:
        model = FormDispensaEdFisica
        fields = "__all__"

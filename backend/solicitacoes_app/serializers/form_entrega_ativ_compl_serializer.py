from rest_framework.serializers import ModelSerializer
from ..models.form_entrega_ativ_compl import FormEntregaAtivCompl

class FormEntregaAtivComplSerializer(ModelSerializer):

    class Meta:
        model = FormEntregaAtivCompl
        fields = '__all__'
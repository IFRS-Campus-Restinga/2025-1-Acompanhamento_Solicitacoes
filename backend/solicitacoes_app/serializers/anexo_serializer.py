from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from ..models.anexo import Anexo

class AnexoSerializer(ModelSerializer):
    class Meta:
        model = Anexo
        fields = [
            'anexo',
            'form_abono_falta',
            'form_exercicos_domiciliares'
        ]

    def validate(self, data):
        # Garantir que apenas um formulário está vinculado ao anexo
        forms = [
            data.get('form_abono_falta'),
            data.get('form_exercicos_domiciliares')
        ]
        filled_forms = sum(bool(form) for form in forms)

        if filled_forms != 1:
            raise serializers.ValidationError("Um anexo deve estar vinculado a apenas um formulário.")

        return data

from rest_framework import serializers
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from ...models.forms.form_dispensa_ed_fisica import FormDispensaEdFisica
from ..solicitacao_serializer import BaseSolicitacaoModelSerializer

class FormDispEdFisicaSerializer(BaseSolicitacaoModelSerializer):
    anexos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = FormDispensaEdFisica
        fields = "__all__"

    def create(self, validated_data):
        arquivos = validated_data.pop("anexos", [])
        caminhos = []

        for arquivo in arquivos:
            path = default_storage.save(f'uploads/{arquivo.name}', ContentFile(arquivo.read()))
            caminhos.append(path)

        instance = super().create(validated_data)
        return instance

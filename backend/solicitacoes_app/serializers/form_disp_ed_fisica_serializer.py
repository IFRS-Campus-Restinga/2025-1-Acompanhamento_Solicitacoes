from rest_framework import serializers
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from ..models.form_dispensa_ed_fisica import FormDispensaEdFisica

class FormDispEdFisicaSerializer(serializers.ModelSerializer):
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

        validated_data["anexos"] = caminhos
        return FormDispensaEdFisica.objects.create(**validated_data)

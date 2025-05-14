from rest_framework import serializers
from ..models.form_entrega_ativ_compl import FormEntregaAtivCompl
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

class FormEntregaAtivComplSerializer(serializers.ModelSerializer):
    anexos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )


    class Meta:
        model = FormEntregaAtivCompl
        fields = '__all__'

        def create(self, validated_data):
            arquivos = validated_data.pop("anexos", [])
            caminhos = []

            for arquivo in arquivos:
                path = default_storage.save(f'uploads/{arquivo.name}', ContentFile(arquivo.read()))
                caminhos.append(path)

            validated_data["anexos"] = caminhos
            return FormEntregaAtivCompl.objects.create(**validated_data)

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import serializers
from ..models.disciplina import Disciplina
from ..models.form_entrega_ativ_compl import FormEntregaAtivCompl

class FormEntregaAtivComplSerializer(serializers.ModelSerializer):
    disciplinas = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Disciplina.objects.all(),
        write_only=True
    )
    anexos = serializers.ListField(
        child=serializers.FileField(write_only=True),
        write_only=True,
        required=False,
        allow_empty=True
    )
    caminhos_anexos = serializers.ListField(
        child=serializers.CharField(read_only=True),
        read_only=True
    )

    class Meta:
        model = FormEntregaAtivCompl
        fields = '__all__'
        extra_kwargs = {'anexos': {'write_only': True}, 'caminhos_anexos': {'read_only': True}}

    def create(self, validated_data):
        arquivos = validated_data.pop("anexos", [])
        caminhos = []

        for arquivo in arquivos:
            path = default_storage.save(f'uploads/{arquivo.name}', ContentFile(arquivo.read()))
            caminhos.append(path)

        validated_data["anexos"] = caminhos  # Salva os caminhos no campo 'anexos' do modelo

        disciplinas_data = validated_data.pop('disciplinas', [])
        form_entrega = FormEntregaAtivCompl.objects.create(**validated_data)
        form_entrega.disciplinas.set(disciplinas_data)
        return form_entrega
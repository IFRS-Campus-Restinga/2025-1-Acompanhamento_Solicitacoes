from rest_framework import serializers
from ..models import MotivoAbono, FormAbonoFalta, Anexo
from .motivo_abono_serializer import MotivoAbonoSerializer

class FormAbonoFaltaSerializer(serializers.ModelSerializer):
    motivo_solicitacao = MotivoAbonoSerializer(read_only=True)
    motivo_solicitacao_id = serializers.PrimaryKeyRelatedField(
        source='motivo_solicitacao',
        queryset=MotivoAbono.objects.all(),
        label="Motivo da Solicitação",
        write_only=True
    )
    anexos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        label="Anexar Documentos",
        required=False
    )

    class Meta:
        model = FormAbonoFalta
        fields = [
            'id',
            'aluno_nome',
            'email',
            'matricula',
            'motivo_solicitacao',
            'motivo_solicitacao_id',
            'anexos',
            'data_inicio_afastamento',
            'data_fim_afastamento',
            'acesso_moodle',
            'perdeu_atividades'
        ]

    def validate_anexos(self, value):
        """
        Validação dos arquivos anexos para tamanho e tipo permitido.
        """
        if len(value) > 5:
            raise serializers.ValidationError("Não é permitido enviar mais de 5 arquivos.")
        for arquivo in value:
            if arquivo.size > 5242880:  # Limite de 5 MB por arquivo
                raise serializers.ValidationError(f"O arquivo {arquivo.name} excede o tamanho máximo permitido de 5 MB.")
            if not arquivo.content_type.startswith(('application/pdf', 'image/')):
                raise serializers.ValidationError(f"O arquivo {arquivo.name} tem um tipo não permitido.")
        return value

    def validate(self, data):
        """
        Validação adicional para garantir que as datas sejam consistentes.
        """
        data_inicio = data.get('data_inicio_afastamento')
        data_fim = data.get('data_fim_afastamento')

        if data_inicio and data_fim and data_fim < data_inicio:
            raise serializers.ValidationError({
                'data_fim_afastamento': 'A data de fim do afastamento não pode ser anterior à data de início.'
            })
        return data

    def create(self, validated_data):
        """
        Criação de um registro de FormAbonoFalta com anexos.
        """
        anexos_data = validated_data.pop('anexos', [])
        instance = FormAbonoFalta.objects.create(**validated_data)

        # Criar os anexos vinculados ao formulário
        for arquivo in anexos_data:
            Anexo.objects.create(
                anexo=arquivo,
                form_abono_falta=instance
            )

        return instance

from rest_framework import serializers
from ..models import MotivoAbono, FormAbonoFalta, Anexo
from .motivo_abono_serializer import MotivoAbonoSerializer
from .anexo_serializer import AnexoSerializer

class FormAbonoFaltaSerializer(serializers.ModelSerializer):
    motivo_solicitacao = MotivoAbonoSerializer(read_only=True)
    motivo_solicitacao_id = serializers.PrimaryKeyRelatedField(
        source='motivo_solicitacao',
        queryset=MotivoAbono.objects.all(),
        label="Motivo da Solicitação",
        write_only=True
    )

    # Campo para anexar documentos diretamente ao formulário
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

    def create(self, validated_data):
        anexos_data = validated_data.pop('anexos', [])  # Remove anexos do validated_data
        form_abono_falta = FormAbonoFalta.objects.create(**validated_data)

        # Salvar os anexos enviados
        for arquivo in anexos_data:
            Anexo.objects.create(anexo=arquivo, form_abono_falta=form_abono_falta)

        return form_abono_falta

    def update(self, instance, validated_data):
        anexos_data = validated_data.pop('anexos', [])  # Remove anexos do validated_data

        # Atualizar campos do formulário
        instance.acesso_moodle = validated_data.get('acesso_moodle', instance.acesso_moodle)
        instance.perdeu_atividades = validated_data.get('perdeu_atividades', instance.perdeu_atividades)
        instance.motivo_solicitacao = validated_data.get('motivo_solicitacao', instance.motivo_solicitacao)
        instance.data_inicio_afastamento = validated_data.get('data_inicio_afastamento', instance.data_inicio_afastamento)
        instance.data_fim_afastamento = validated_data.get('data_fim_afastamento', instance.data_fim_afastamento)
        instance.save()

        # Salvar os anexos enviados
        for arquivo in anexos_data:
            Anexo.objects.create(anexo=arquivo, form_abono_falta=instance)

        return instance


    def validate(self, data):
        data_inicio = data.get('data_inicio_afastamento')
        data_fim = data.get('data_fim_afastamento')

        if data_inicio and data_fim and data_fim < data_inicio:
            raise serializers.ValidationError({
                'data_fim_afastamento': 'A data de fim do afastamento não pode ser anterior à data de início.'
            })
        
        return data
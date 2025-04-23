from rest_framework import serializers
from ..models import MotivoAbono, FormAbonoFalta
from .motivo_abono_serializer import MotivoAbonoSerializer

class FormAbonoFaltaSerializer(serializers.ModelSerializer):
    motivo_solicitacao = MotivoAbonoSerializer(read_only=True)
    motivo_solicitacao_id = serializers.PrimaryKeyRelatedField(
        source='motivo_solicitacao',
        queryset=MotivoAbono.objects.all(),
        label="Motivo da Solicitação",
        write_only=True
    )

    class Meta:
        model = FormAbonoFalta
        fields = [
            'id',
            'nome',
            'recebe_auxilio_estudantil',
            'acesso_ao_moodle',
            'motivo_solicitacao',
            'motivo_solicitacao_id',
            'data_inicio_afastamento',
            'data_fim_afastamento'   
        ]
from rest_framework import serializers
from ..models import MotivoAbono, FormAbonoFalta, Disciplina
from ..serializers.campos_solic_serializers.motivo_abono_serializer import MotivoAbonoSerializer
# Importamos nosso molde base
from .solicitacao_serializer import BaseSolicitacaoModelSerializer

class FormAbonoFaltaSerializer(BaseSolicitacaoModelSerializer):
    motivo_solicitacao = serializers.PrimaryKeyRelatedField(
        queryset=MotivoAbono.objects.all(),
        label="Motivo da Solicitação"
    )
    disciplinas = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        many=True,
        required=False 
    )
    anexos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    motivo_solicitacao_info = MotivoAbonoSerializer(source='motivo_solicitacao', read_only=True)
    disciplinas_info = serializers.SerializerMethodField(read_only=True)
    curso_info = serializers.StringRelatedField(source='aluno.curso', read_only=True)

    class Meta:
        model = FormAbonoFalta
        fields = '__all__' 
        
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

    def validate_data(self, data):
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

    def get_disciplinas_info(self, obj):
        return [{'codigo': d.codigo, 'nome': d.nome} for d in obj.disciplinas.all()]
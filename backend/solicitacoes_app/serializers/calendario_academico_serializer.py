from rest_framework import serializers
from .models import CalendarioAcademico

class CalendarioAcademicoSerializer(serializers.ModelSerializer):
    # Campos calculados (apenas para exibição)
    nome_formulario = serializers.CharField(
        source='get_formulario_display',  # Pega o nome legível do choice (ex: "Trancamento de Disciplina")
        read_only=True
    )
    nome_tipo_curso = serializers.CharField(
        source='get_tipo_curso_display',  # Pega o nome legível (ex: "Graduação (Semestral)")
        read_only=True
    )
    esta_ativo = serializers.BooleanField(read_only=True)  # Usa a property `esta_ativo` do model

    class Meta:
        model = CalendarioAcademico
        fields = [
            'codigo',
            'formulario',
            'nome_formulario',  # Nome legível do formulário
            'tipo_curso',
            'nome_tipo_curso',  # Nome legível do tipo de curso
            'data_inicio',
            'data_fim',
            'ativo',
            'esta_ativo'  # Calcula se o prazo está vigente
        ]
        extra_kwargs = {
            'codigo': {'required': True, 'allow_blank': False},
            'formulario': {'required': True},
            'tipo_curso': {'required': True},
            'data_inicio': {'required': True},
            'data_fim': {'required': True}
        }

    def validate(self, dados):
        """Validações customizadas"""
        # 1. Data final não pode ser anterior à inicial
        if dados['data_fim'] < dados['data_inicio']:
            raise serializers.ValidationError(
                {'data_fim': 'A data final não pode ser anterior à data inicial.'}
            )

        # 2. Não permite dois prazos ativos para o mesmo formulário + código
        if dados.get('ativo', True):
            conflitos = CalendarioAcademico.objects.filter(
                formulario=dados['formulario'],
                codigo=dados['codigo'],
                ativo=True
            )
            # Ignora a instância atual se estiver sendo editada
            if self.instance:
                conflitos = conflitos.exclude(pk=self.instance.pk)
            if conflitos.exists():
                raise serializers.ValidationError(
                    {'ativo': 'Já existe um prazo ativo para este formulário e código.'}
                )

        return dados

    def to_representation(self, instance):
        """Formata o JSON de saída (datas em ISO 8601)"""
        dados = super().to_representation(instance)
        dados['data_inicio'] = instance.data_inicio.isoformat()  # Formato: YYYY-MM-DD
        dados['data_fim'] = instance.data_fim.isoformat()
        return dados
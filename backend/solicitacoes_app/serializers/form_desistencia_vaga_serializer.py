from rest_framework import serializers
from ..models import FormDesistenciaVaga, Curso

class FormDesistenciaVagaSerializer(serializers.ModelSerializer):

    aluno_nome = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    cpf = serializers.CharField(max_length=14)
    motivo_solicitacao = serializers.CharField(max_length=255)
    curso = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(), required=False, allow_null=True
    )
    tipo_curso = serializers.ChoiceField(choices=FormDesistenciaVaga.TIPO_CURSO_CHOICES)
    motivo_desistencia = serializers.ChoiceField(choices=FormDesistenciaVaga.MOTIVO_DESISTENCIA_CHOICES)
    ano_semestre_ingresso = serializers.CharField(max_length=7)
    menor_idade = serializers.BooleanField()
    recebe_auxilio_estudantil = serializers.BooleanField()

    atestado_vaga_nova_escola = serializers.FileField(required=False, allow_null=True)
    doc_identificacao_responsavel = serializers.FileField(required=False, allow_null=True)
    declaracao_biblioteca = serializers.FileField(required=True)

    class Meta:
        model = FormDesistenciaVaga
        fields = [
            'aluno_nome', 'email', 'cpf', 'motivo_solicitacao', 'curso', 'tipo_curso',
            'motivo_desistencia', 'ano_semestre_ingresso', 'recebe_auxilio_estudantil', 'menor_idade',
            'atestado_vaga_nova_escola', 'doc_identificacao_responsavel',
            'declaracao_biblioteca'
        ]

    def validate(self, data):
        tipo = data.get('tipo_curso')

        if tipo == 'medio_integrado':
            if not data.get('atestado_vaga_nova_escola'):
                raise serializers.ValidationError({
                    'atestado_vaga_nova_escola': 'Este documento é obrigatório para estudantes do Ensino Médio Integrado.'
                })
            if not data.get('doc_identificacao_responsavel'):
                raise serializers.ValidationError({
                    'doc_identificacao_responsavel': 'Este documento é obrigatório para estudantes do Ensino Médio Integrado.'
                })

        return data

    def create(self, validated_data):
        return FormDesistenciaVaga.objects.create(**validated_data)

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        instance.full_clean()
        instance.save()
        return instance

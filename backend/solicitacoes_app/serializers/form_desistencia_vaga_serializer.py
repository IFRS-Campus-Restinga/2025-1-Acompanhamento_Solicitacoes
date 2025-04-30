from rest_framework import serializers
from ..models import FormDesistenciaVaga, Curso

class FormDesistenciaVagaSerializer(serializers.ModelSerializer):
    
    aluno_nome = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    matricula = serializers.CharField(max_length=20)
    motivo_solicitacao = serializers.CharField(max_length=255)
    curso = serializers.PrimaryKeyRelatedField( queryset=Curso.objects.all(), required=False, allow_null=True)
    tipo_curso = serializers.ChoiceField(choices=FormDesistenciaVaga.TIPO_CURSO_CHOICES)
    atestado_vaga_nova_escola = serializers.FileField(required=False, allow_null=True)
    doc_identificacao_responsavel = serializers.FileField(required=False, allow_null=True)
    declaracao_biblioteca = serializers.FileField(required=True)


    class Meta:
        model = FormDesistenciaVaga
        fields = [
            'aluno_nome', 'email', 'matricula', 'motivo_solicitacao','curso', 'tipo_curso',
            'atestado_vaga_nova_escola', 'doc_identificacao_responsavel', 
            'declaracao_biblioteca'
        ]

    def validate(self, data):
        tipo = data.get('tipo_curso')

        if tipo == 'medio':
            if not data.get('documento_atestado_vaga'):
                raise serializers.ValidationError({
                    'documento_atestado_vaga': 'Este documento é obrigatório para estudantes do Ensino Médio.'
                })
            if not data.get('documento_rg_responsavel'):
                raise serializers.ValidationError({
                    'documento_rg_responsavel': 'Este documento é obrigatório para estudantes do Ensino Médio.'
                })

        return data
    
    def create(self, validated_data):
        # Adapte os dados antes de criar o objeto, se necessário
        return FormDesistenciaVaga.objects.create(**validated_data)

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        instance.full_clean()
        instance.save()
        return instance

from rest_framework import serializers
from ..models import FormExercicioDomiciliar, Curso

class FormExercicioDomiciliarSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    matricula = serializers.CharField(max_length=20)
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    componentes_curriculares = serializers.CharField()
    
    motivo_solicitacao = serializers.ChoiceField(choices=FormExercicioDomiciliar.MOTIVOS_SOLICITACAO_CHOICES)
    outro_motivo = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    
    periodo_afastamento = serializers.CharField(max_length=255)
    
    documento_apresentado = serializers.ChoiceField(choices=FormExercicioDomiciliar.DOCUMENTO_APRESENTADO_CHOICES)
    outro_documento = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    
    arquivos = serializers.FileField(required=False, allow_null=True)
    consegue_realizar_atividades = serializers.BooleanField()

    class Meta:
        model = FormExercicioDomiciliar
        fields = [
            'aluno_nome', 'email', 'matricula', 'curso', 'componentes_curriculares',
            'motivo_solicitacao', 'outro_motivo', 'periodo_afastamento',
            'documento_apresentado', 'outro_documento', 'arquivos', 'consegue_realizar_atividades'
        ]

    def validate(self, data):
        # Validação extra: outro_motivo precisa ser preenchido se motivo_solicitacao for 'outro'
        if data.get('motivo_solicitacao') == 'outro' and not data.get('outro_motivo'):
            raise serializers.ValidationError({
                "outro_motivo": "É necessário descrever o outro motivo da solicitação."
            })
        
        # Validação extra: outro_documento precisa ser preenchido se documento_apresentado for 'outro'
        if data.get('documento_apresentado') == 'outro' and not data.get('outro_documento'):
            raise serializers.ValidationError({
                "outro_documento": "É necessário descrever o outro tipo de documento apresentado."
            })

        return data
    
    def validate_periodo_afastamento(self, value):
        if len(value.split()) < 4:  # Garante uma descrição detalhada
            raise serializers.ValidationError("Por favor, informe um período de afastamento válido, incluindo datas específicas.")
        return value


    def save(self, **kwargs):
        formExercicio = super().save(**kwargs)
        formExercicio.full_clean()
        formExercicio.save()
        return formExercicio

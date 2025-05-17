from rest_framework import serializers
from ..models import FormExercicioDomiciliar, Curso
from datetime import date  
from django.contrib.auth import get_user_model
from ..models.ppc import Ppc

User = get_user_model()

class FormExercicioDomiciliarSerializer(serializers.ModelSerializer):
    # Campos para escrita
    curso_codigo = serializers.SlugRelatedField(
        source='curso',
        queryset=Curso.objects.all(),
        slug_field='codigo',
        write_only=True
    )
    
    aluno_email = serializers.EmailField(write_only=True)
    
    # Campos para leitura
    curso_nome = serializers.StringRelatedField(source='curso', read_only=True)
    aluno_nome = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    matricula = serializers.CharField(read_only=True)
    periodo_afastamento = serializers.SerializerMethodField()
    ppc = serializers.PrimaryKeyRelatedField(queryset=Ppc.objects.all(), required=False)

    class Meta:
        model = FormExercicioDomiciliar
        fields = [
            'id',
            'ppc',
            'aluno_email',
            'aluno_nome',
            'email',
            'matricula',
            'curso_codigo',
            'curso_nome',
            'componentes_curriculares',
            'motivo_solicitacao',
            'outro_motivo',
            'data_inicio_afastamento',
            'data_fim_afastamento',
            'periodo_afastamento',
            'documento_apresentado',
            'outro_documento',
            'arquivos',
            'consegue_realizar_atividades',
        ]

    def get_periodo_afastamento(self, obj):
        return obj.periodo_afastamento

    def create(self, validated_data):
        email = validated_data.pop('aluno_email', None)
        curso_codigo = validated_data.pop('curso_codigo', None)
        validated_data['data_solicitacao'] = date.today()
        
        if email:
            try:
                user = User.objects.get(email=email)
                # Método seguro para obter o nome completo
                full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
                validated_data.update({
                    'aluno_nome': full_name or user.username,
                    'email': user.email,
                    'matricula': getattr(user, 'matricula', '')
                })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    "aluno_email": "Usuário não encontrado com este email."
                })
        
        return super().create(validated_data)

    def validate(self, data):
        inicio = data.get('data_inicio_afastamento')
        fim = data.get('data_fim_afastamento')

        if inicio and fim:
            if fim < inicio:
                raise serializers.ValidationError({
                    "data_fim_afastamento": "A data de fim deve ser posterior à data de início."
                })

        if data.get('motivo_solicitacao') == 'outro' and not data.get('outro_motivo'):
            raise serializers.ValidationError({
                "outro_motivo": "É necessário descrever o outro motivo da solicitação."
            })
        
        if data.get('documento_apresentado') == 'outro' and not data.get('outro_documento'):
            raise serializers.ValidationError({
                "outro_documento": "É necessário descrever o outro tipo de documento apresentado."
            })

        return data

    def save(self, **kwargs):
        try:
            formExercicio = super().save(**kwargs)
            formExercicio.full_clean()
            formExercicio.save()
            return formExercicio
        except Exception as e:
            raise serializers.ValidationError(str(e))
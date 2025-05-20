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
     periodo = serializers.CharField(required=True) 

    class Meta:
        model = FormExercicioDomiciliar
        fields = [
            'id',
            'ppc',
            'periodo',
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

     def get_aluno_nome(self, obj):
        if hasattr(obj, 'solicitacao') and obj.solicitacao.aluno:
            return obj.solicitacao.aluno.usuario.nome
        return None
        
    def get_email(self, obj):
        if hasattr(obj, 'solicitacao') and obj.solicitacao.aluno:
            return obj.solicitacao.aluno.usuario.email
        return None
        
    def get_matricula(self, obj):
        if hasattr(obj, 'solicitacao') and obj.solicitacao.aluno:
            return obj.solicitacao.aluno.matricula
        return None

    def get_periodo_afastamento(self, obj):
        return obj.periodo_afastamento

    def create(self, validated_data):
        email = validated_data.pop('aluno_email', None)
        curso_codigo = validated_data.pop('curso_codigo', None)
        validated_data['data_solicitacao'] = date.today()
        
        # Busca o aluno pelo email para criar a relação
        if email:
            try:
                user = User.objects.get(email=email)
                aluno = Aluno.objects.get(usuario=user)
                
                # A relação com o aluno será estabelecida pela Solicitação
                # Não precisamos mais definir aluno_nome, email e matricula aqui
                
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    "aluno_email": "Usuário não encontrado com este email."
                })
            except Aluno.DoesNotExist:
                raise serializers.ValidationError({
                    "aluno_email": "Aluno não encontrado para este usuário."
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
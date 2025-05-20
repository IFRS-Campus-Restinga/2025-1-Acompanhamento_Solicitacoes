from rest_framework import serializers
from ..models import FormExercicioDomiciliar, Curso, Disciplina
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
    
    disciplinas = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    
    aluno_email = serializers.EmailField(write_only=True)
    
    # Campos para leitura
    curso_nome = serializers.StringRelatedField(source='curso', read_only=True)
    aluno_nome = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    matricula = serializers.CharField(read_only=True)
    periodo_afastamento = serializers.SerializerMethodField()
    ppc_codigo = serializers.CharField(source='ppc.codigo', read_only=True)
    periodo = serializers.CharField(required=True)
    disciplinas_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FormExercicioDomiciliar
        fields = [
            'id',
            'periodo',
            'aluno_email',
            'aluno_nome',
            'email',
            'matricula',
            'curso_codigo',
            'curso_nome',
            'ppc_codigo',
            'disciplinas',  # Para escrita
            'disciplinas_info',  # Para leitura
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
        
    def get_disciplinas_info(self, obj):
        return [
            {'codigo': d.codigo, 'nome': d.nome} 
            for d in obj.disciplinas.all()
        ]

    def create(self, validated_data):
        # Extrai os dados específicos
        disciplinas_data = validated_data.pop('disciplinas', [])
        email = validated_data.pop('aluno_email', None)
        validated_data['data_solicitacao'] = date.today()
        
        # Busca o aluno pelo email para criar a relação
        if email:
            try:
                user = User.objects.get(email=email)
                aluno = Aluno.objects.get(usuario=user)
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    "aluno_email": "Usuário não encontrado com este email."
                })
            except Aluno.DoesNotExist:
                raise serializers.ValidationError({
                    "aluno_email": "Aluno não encontrado para este usuário."
                })
        
        # Cria o formulário
        instance = super().create(validated_data)
        
        # Associa as disciplinas
        if disciplinas_data:
            instance.disciplinas.set(disciplinas_data)
        
        return instance

    def update(self, instance, validated_data):
        disciplinas_data = validated_data.pop('disciplinas', None)
        
        # Atualiza os campos normais
        instance = super().update(instance, validated_data)
        
        # Atualiza as disciplinas se fornecidas
        if disciplinas_data is not None:
            instance.disciplinas.set(disciplinas_data)
        
        return instance

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
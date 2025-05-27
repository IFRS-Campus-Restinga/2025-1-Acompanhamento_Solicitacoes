from rest_framework import serializers
from ..models import MotivoAbono, FormAbonoFalta, Anexo, Curso, Disciplina
from .motivo_abono_serializer import MotivoAbonoSerializer

class FormAbonoFaltaSerializer(serializers.ModelSerializer):

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

    motivo_solicitacao = MotivoAbonoSerializer(read_only=True)
    motivo_solicitacao_id = serializers.PrimaryKeyRelatedField(
        source='motivo_solicitacao',
        queryset=MotivoAbono.objects.all(),
        label="Motivo da Solicitação",
        write_only=True
    )
    anexos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        label="Anexar Documentos",
        required=False
    )

    curso_nome = serializers.StringRelatedField(source='curso', read_only=True)
    aluno_nome = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    matricula = serializers.CharField(read_only=True)
    ppc_codigo = serializers.CharField(source='ppc.codigo', read_only=True)
    disciplinas_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FormAbonoFalta
        fields = [
            'id',
            'aluno_email',
            'aluno_nome',
            'email',
            'matricula',
            'curso_codigo',
            'curso_nome',
            'ppc_codigo',
            'disciplinas', 
            'disciplinas_info',
            'motivo_solicitacao',
            'motivo_solicitacao_id',
            'data_inicio_afastamento',
            'data_fim_afastamento',
            'anexos',
            'acesso_moodle',
            'perdeu_atividades'
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

    

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

    disciplinas = serializers.SlugRelatedField(
        queryset=Disciplina.objects.all(),
        slug_field="codigo",
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
        # 🔎 Extração dos dados enviados
        email = validated_data.pop('aluno_email', None)
        curso_codigo = validated_data.pop('curso_codigo', None)
        disciplinas_codigos = validated_data.pop('disciplinas', [])

        # ✅ Validação de campos obrigatórios
        if not email:
            raise serializers.ValidationError({"aluno_email": "O email do aluno é obrigatório."})
        
        if not curso_codigo:
            raise serializers.ValidationError({"curso_codigo": "O código do curso é obrigatório."})

        # 🔎 Busca o aluno pelo email
        try:
            user = Usuario.objects.get(email=email)
            aluno = user.aluno
        except Usuario.DoesNotExist:
            raise serializers.ValidationError({"aluno_email": "Usuário não encontrado com este email."})
        except Aluno.DoesNotExist:
            raise serializers.ValidationError({"aluno_email": "Aluno não encontrado para este usuário."})

        # 🔎 Busca o curso pelo código
        try:
            curso = Curso.objects.get(codigo=curso_codigo)
        except Curso.DoesNotExist:
            raise serializers.ValidationError({"curso_codigo": "Curso não encontrado com este código."})

        # 🔎 Busca as disciplinas pelos códigos diretamente
        disciplinas_objetos = Disciplina.objects.filter(codigo__in=disciplinas_codigos)
        if len(disciplinas_objetos) != len(disciplinas_codigos):
            raise serializers.ValidationError({"disciplinas": "Algumas disciplinas não foram encontradas."})

        # Adiciona o curso e a data de solicitação
        validated_data["curso"] = curso
        validated_data["data_solicitacao"] = date.today()

        # 🔥 Cria a solicitação de abono
        instance = super().create(validated_data)

        # 🏷️ Associa as disciplinas corretamente
        instance.disciplinas.set(disciplinas_objetos)
        
        return instance




    def update(self, instance, validated_data):
        disciplinas_codigos = validated_data.pop('disciplinas', None)

        # Atualiza os campos normais
        instance = super().update(instance, validated_data)

        # Se houver disciplinas na requisição, converte os códigos para IDs
        if disciplinas_codigos:
            disciplinas_objetos = Disciplina.objects.filter(codigo__in=disciplinas_codigos)
            if not disciplinas_objetos.exists():
                raise serializers.ValidationError({"disciplinas": "Nenhuma disciplina encontrada com os códigos fornecidos."})
            instance.disciplinas.set(disciplinas_objetos)
        
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

    

# solicitacoes_app/serializers/forms/form_desistencia_vaga_serializer.py

from rest_framework import serializers
from ...models.forms.form_desistencia_vaga import FormDesistenciaVaga
from ...models import Curso, Aluno, Usuario
from ...serializers.curso_serializer import CursoListSerializer
from django.contrib.auth.models import Group

class FormDesistenciaVagaSerializer(serializers.ModelSerializer):
    """
    Serializer para formulário de desistência de vaga.
    Suporta tanto alunos quanto usuários externos.
    """
    
    # Campos para identificação do solicitante
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), 
        source='aluno', 
        required=False, 
        allow_null=True, 
        write_only=True
    )
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), 
        source='usuario', 
        required=False, 
        allow_null=True, 
        write_only=True
    )
    
    # Campos de dados pessoais
    nome_completo = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    cpf = serializers.CharField(max_length=14)
    
    # Campo do curso - agora usando PrimaryKeyRelatedField para o modelo Curso
    curso = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(),
        required=True
    )
    
    # Campos read-only para informações do curso
    curso_info = serializers.SerializerMethodField(read_only=True)
    
    # Motivo da desistência
    motivo_desistencia = serializers.PrimaryKeyRelatedField(
        queryset=FormDesistenciaVaga._meta.get_field('motivo_desistencia').related_model.objects.all()
    )
    descricao_motivo = serializers.CharField(style={'base_template': 'textarea.html'})
    
    # Informações adicionais
    recebe_auxilio_estudantil = serializers.BooleanField(default=False)
    menor_idade = serializers.BooleanField(default=False)
    declaracao_final_acordo = serializers.BooleanField(default=False)
    
    # Documentos
    declaracao_biblioteca = serializers.FileField()
    atestado_vaga_nova_escola = serializers.FileField(required=False, allow_null=True)
    doc_identificacao_responsavel = serializers.FileField(required=False, allow_null=True)
    
    # Campos read-only
    tipo_solicitante = serializers.ReadOnlyField()
    nome_solicitante = serializers.ReadOnlyField()
    email_solicitante = serializers.ReadOnlyField()
    data_criacao = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()
    
    class Meta:
        model = FormDesistenciaVaga
        fields = [
            'id', 'aluno_id', 'usuario_id', 'nome_completo', 'email', 'cpf',
            'curso', 'curso_info', 'motivo_desistencia', 'descricao_motivo',
            'recebe_auxilio_estudantil', 'menor_idade', 'declaracao_final_acordo',
            'declaracao_biblioteca', 'atestado_vaga_nova_escola', 'doc_identificacao_responsavel',
            'tipo_solicitante', 'nome_solicitante', 'email_solicitante', 
            'data_criacao', 'status', 'observacoes'
        ]
        read_only_fields = [
            'id', 'tipo_solicitante', 'nome_solicitante', 'email_solicitante',
            'data_criacao', 'status', 'curso_info'
        ]
    
    def get_curso_info(self, obj):
        """Retorna informações detalhadas do curso"""
        if obj.curso:
            return {
                'codigo': obj.curso.codigo,
                'nome': obj.curso.nome,
                'tipo_curso': obj.curso.tipo_curso,
                'tipo_curso_display': obj.curso.get_tipo_curso_display(),
                'nome_completo': f"{obj.curso.nome} - {obj.curso.get_tipo_curso_display()}"
            }
        return None
    
    def validate(self, data):
        """Validações customizadas"""
        aluno = data.get('aluno')
        usuario = data.get('usuario')
        motivo_desistencia = data.get('motivo_desistencia')
        menor_idade = data.get('menor_idade', False)
        declaracao_final_acordo = data.get('declaracao_final_acordo', False)
        curso = data.get('curso')
        
        # Validação de solicitante
        if not aluno and not usuario:
            # Se não há aluno nem usuario especificado, verifica se o usuário logado pode ser usado
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                user_groups = request.user.groups.values_list('name', flat=True)
                if 'externo' in user_groups or 'responsavel' in user_groups:
                    # Usuário logado será usado como solicitante
                    data['usuario'] = request.user
                else:
                    raise serializers.ValidationError(
                        "Uma solicitação deve estar associada a um Aluno ou Usuário externo/responsável."
                    )
            else:
                raise serializers.ValidationError(
                    "Uma solicitação deve estar associada a um Aluno ou Usuário."
                )
        
        # Não pode ter aluno E usuario preenchidos simultaneamente
        if aluno and usuario:
            raise serializers.ValidationError(
                "Uma solicitação não pode ter Aluno e Usuário preenchidos simultaneamente."
            )
        
        # Validação da declaração final
        if not declaracao_final_acordo:
            raise serializers.ValidationError({
                'declaracao_final_acordo': 'É obrigatório aceitar a declaração final.'
            })
        
        # Validação condicional para motivo de transferência
        if motivo_desistencia and hasattr(motivo_desistencia, 'descricao'):
            if 'transferência' in motivo_desistencia.descricao.lower():
                if not data.get('atestado_vaga_nova_escola'):
                    raise serializers.ValidationError({
                        'atestado_vaga_nova_escola': 'Atestado de vaga na nova escola é obrigatório para transferências.'
                    })
        
        # Validação para menores de idade em cursos EMI
        if menor_idade and curso:
            if hasattr(curso, 'tipo_curso') and curso.tipo_curso == Curso.TipoCurso.EMI:
                if not data.get('doc_identificacao_responsavel'):
                    raise serializers.ValidationError({
                        'doc_identificacao_responsavel': 'Documento de identificação do responsável é obrigatório para menores de idade em cursos EMI.'
                    })
        
        return data
    
    def create(self, validated_data):
        """Criação customizada do formulário"""
        aluno = validated_data.get('aluno')
        usuario = validated_data.get('usuario')
        
        # Se é um aluno, preenche automaticamente alguns dados do aluno se não foram fornecidos
        if aluno:
            if not validated_data.get('nome_completo'):
                validated_data['nome_completo'] = aluno.nome
            if not validated_data.get('email'):
                validated_data['email'] = aluno.usuario.email if aluno.usuario else ''
            if not validated_data.get('cpf') and hasattr(aluno, 'cpf'):
                validated_data['cpf'] = aluno.cpf
        
        # Se é um usuário externo/responsável, usa dados do usuário se não fornecidos
        elif usuario:
            if not validated_data.get('nome_completo'):
                validated_data['nome_completo'] = f"{usuario.first_name} {usuario.last_name}".strip()
            if not validated_data.get('email'):
                validated_data['email'] = usuario.email
        
        # Se não há usuario especificado mas há um usuário logado, usa-o
        request = self.context.get('request')
        if not usuario and not aluno and request and request.user.is_authenticated:
            user_groups = request.user.groups.values_list('name', flat=True)
            if 'externo' in user_groups or 'responsavel' in user_groups:
                validated_data['usuario'] = request.user
                if not validated_data.get('nome_completo'):
                    validated_data['nome_completo'] = f"{request.user.first_name} {request.user.last_name}".strip()
                if not validated_data.get('email'):
                    validated_data['email'] = request.user.email
        
        return FormDesistenciaVaga.objects.create(**validated_data)
    
    def to_representation(self, instance):
        """Customiza a representação de saída"""
        data = super().to_representation(instance)
        
        # Adiciona informações do solicitante
        data['solicitante_info'] = {
            'tipo': instance.tipo_solicitante,
            'nome': instance.nome_solicitante,
            'email': instance.email_solicitante
        }
        
        # Adiciona informações do motivo
        if instance.motivo_desistencia:
            data['motivo_desistencia_info'] = {
                'id': instance.motivo_desistencia.id,
                'descricao': instance.motivo_desistencia.descricao
            }
        
        # Adiciona display names para status
        if hasattr(instance, 'get_status_display'):
            data['status_display'] = instance.get_status_display()
        
        return data


class FormDesistenciaVagaListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listagem de formulários.
    """
    solicitante_nome = serializers.CharField(source='nome_solicitante', read_only=True)
    curso_nome = serializers.CharField(source='curso.nome', read_only=True)
    curso_tipo = serializers.CharField(source='curso.get_tipo_curso_display', read_only=True)
    motivo_descricao = serializers.CharField(source='motivo_desistencia.descricao', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tipo_solicitante = serializers.ReadOnlyField()
    
    class Meta:
        model = FormDesistenciaVaga
        fields = [
            'id', 'solicitante_nome', 'email', 'curso_nome', 'curso_tipo',
            'motivo_descricao', 'status_display', 'tipo_solicitante',
            'data_criacao', 'status'
        ]


class FormDesistenciaVagaStatusSerializer(serializers.ModelSerializer):
    """
    Serializer específico para atualização de status pela CRE.
    """
    
    class Meta:
        model = FormDesistenciaVaga
        fields = ['status', 'observacoes']
    
    def validate_status(self, value):
        """Valida se o status é válido"""
        valid_statuses = [choice[0] for choice in FormDesistenciaVaga.STATUS_CHOICES] if hasattr(FormDesistenciaVaga, 'STATUS_CHOICES') else []
        if valid_statuses and value not in valid_statuses:
            raise serializers.ValidationError(f"Status inválido. Opções válidas: {valid_statuses}")
        return value


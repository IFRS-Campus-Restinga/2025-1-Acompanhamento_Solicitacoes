from rest_framework import serializers
from ..models import Usuario


class UsuarioMinimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('nome',)


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Usuario.
    """
    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'cpf', 'telefone', 
            'data_nascimento', 'status_usuario', 'is_active'
        ]
        read_only_fields = ['id', 'status_usuario', 'is_active']
    
    def validate_email(self, value):
        """
        Valida se o email é único, considerando o contexto de atualização.
        """
        instance = getattr(self, 'instance', None)
        if instance and instance.email == value:
            # Se estamos atualizando e o email não mudou, é válido
            return value
            
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value
    
    def validate_cpf(self, value):
        """
        Valida se o CPF é único, considerando o contexto de atualização.
        Permite CPF em branco ou nulo.
        """
        if not value:  # CPF é opcional
            return value
            
        instance = getattr(self, 'instance', None)
        if instance and instance.cpf == value:
            # Se estamos atualizando e o CPF não mudou, é válido
            return value
            
        if Usuario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso.")
        return value
    
    def validate(self, data):
     # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.password = "Teste123"
        instance.full_clean() 
        return data
    


class UsuarioSerializerComGrupos(serializers.ModelSerializer):
    grupo = serializers.SerializerMethodField()
    grupo_detalhes = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'cpf', 'telefone', 'data_nascimento',
            'is_active', 'status_usuario', 'grupo', 'grupo_detalhes'
        ]
    
    def get_grupo(self, obj):
        print(f"DEBUG_SERIALIZER: get_grupo chamado para o usuário: {obj.email}")
        if hasattr(obj, 'coordenador') and obj.coordenador is not None:
            print(f"DEBUG_SERIALIZER: {obj.email} é Coordenador.")
            return "Coordenador"
        if hasattr(obj, 'aluno') and obj.aluno is not None:
            print(f"DEBUG_SERIALIZER: {obj.email} é Aluno.")
            return "Aluno"
        if hasattr(obj, 'cre') and obj.cre is not None:
            print(f"DEBUG_SERIALIZER: {obj.email} é CRE.")
            return "CRE"
        if hasattr(obj, 'responsavel') and obj.responsavel is not None:
            print(f"DEBUG_SERIALIZER: {obj.email} é Responsável.")
            return "Responsável"
        print(f"DEBUG_SERIALIZER: {obj.email} é Externo (nenhum papel específico encontrado).")
        return "Externo"
    
    def get_grupo_detalhes(self, obj):
        print(f"DEBUG_SERIALIZER: get_grupo_detalhes chamado para o usuário: {obj.email}")
        if hasattr(obj, 'coordenador') and obj.coordenador is not None:
            # ... (código existente para coordenador)
            return {
                "id": obj.coordenador.id,
                "siape": obj.coordenador.siape,
                "mandatos_coordenador": [
                    {
                        "curso": mandato.curso.codigo,
                        "inicio_mandato": mandato.inicio_mandato.strftime("%d-%m-%Y") if mandato.inicio_mandato else None,
                        "fim_mandato": mandato.fim_mandato.strftime("%d-%m-%Y") if mandato.fim_mandato else None,
                    }
                    for mandato in obj.coordenador.mandatos_coordenador.all()
                ]
            }
        
        if hasattr(obj, 'aluno') and obj.aluno is not None:
            aluno = obj.aluno
            print(f"DEBUG_SERIALIZER: Gerando detalhes para Aluno: {aluno.usuario.email}")
            return {
                "id": aluno.id,
                "matricula": aluno.matricula,
                "curso_codigo": aluno.ppc.curso.codigo if aluno.ppc and aluno.ppc.curso else None,
                "curso_nome": aluno.ppc.curso.nome if aluno.ppc and aluno.ppc.curso else None,
                "ppc_codigo": aluno.ppc.codigo if aluno.ppc else None,
                "ano_ingresso": aluno.ano_ingresso
            }
        
        if hasattr(obj, 'cre'):
            cre = obj.cre
            return {
                "id": cre.id,
                "siape": cre.siape
            }
        if hasattr(obj, 'responsavel'):
            aluno = obj.responsavel.aluno  # Acessa o aluno vinculado
            return {
                "id": obj.responsavel.id,
                "aluno": aluno.usuario.nome if aluno else None,
                "email_aluno": aluno.usuario.email if aluno else None  # Campo novo
            }
        return None
    
    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.password = "Teste123"
        instance.full_clean() 
        return data


class UsuarioWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'cpf', 'telefone', 'data_nascimento']


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['email'].validators = []
        self.fields['cpf'].validators = []

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
        if hasattr(obj, 'coordenador'):
            return "Coordenador"
        if hasattr(obj, 'aluno'):
            return "Aluno"
        if hasattr(obj, 'cre'):
            return "CRE"
        if hasattr(obj, 'responsavel'):
            return "Responsável"
        return "Externo"
    
    def get_grupo_detalhes(self, obj):
        if hasattr(obj, 'coordenador'):
            coordenador = obj.coordenador
            return {
                "id": coordenador.id,
                "siape": coordenador.siape,
                "mandatos_coordenador": [
                    {
                        "curso": mandato.curso.codigo,
                        "inicio_mandato": mandato.inicio_mandato.strftime("%d-%m-%Y") if mandato.inicio_mandato else None,
                        "fim_mandato": mandato.fim_mandato.strftime("%d-%m-%Y") if mandato.fim_mandato else None,
                    }
                    for mandato in coordenador.mandatos_coordenador.all()
                ]
            }
        
        if hasattr(obj, 'aluno'):
            aluno = obj.aluno
            return {
                "id": aluno.id,
                "matricula": aluno.matricula,
                "curso": aluno.ppc.curso.nome,
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
    # Campos que virão do frontend para a lógica de Responsável
    is_responsavel = serializers.BooleanField(write_only=True, required=False, default=False)
    aluno_cpf = serializers.CharField(write_only=True, required=False, max_length=11, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=False) # Adicionado para garantir que a senha possa ser passada

    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'cpf', 'telefone', 'data_nascimento', 'password', 'is_responsavel', 'aluno_cpf']
        # Definir 'password' como 'required=False' se você tem uma senha padrão no model.save()
        extra_kwargs = {
            'password': {'write_only': True, 'required': False} 
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remova ou comente estas linhas se a validação de unicidade for movida para o validate()
        # do serializer, como feito abaixo. Isso evita duplicidade de validação.
        # self.fields['email'].validators = []
        # self.fields['cpf'].validators = []

    def validate(self, data):
        # Validações de unicidade de email e CPF (copiadas do UsuarioSerializer, se este for o único de escrita)
        # Email
        email = data.get('email')
        if email and Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Este email já está em uso."})
        
        # CPF (se fornecido e não em branco)
        cpf = data.get('cpf')
        if cpf and Usuario.objects.filter(cpf=cpf).exists():
            raise serializers.ValidationError({"cpf": "Este CPF já está em uso."})

        # Validação para garantir que aluno_cpf é fornecido se is_responsavel for True
        if data.get('is_responsavel') and not data.get('aluno_cpf'):
            raise serializers.ValidationError({"aluno_cpf": "O CPF do aluno é obrigatório para um Responsável."})
        
        # Executa as validações do model (incluindo validar_cpf, validar_idade)
        temp_instance = Usuario(**data)
        if not data.get('password'): 
            temp_instance.password = "dummy" 
        try:
            temp_instance.full_clean(exclude=['password']) 
        except Exception as e:
            raise serializers.ValidationError(e.message_dict)

        return data

    def create(self, validated_data):
        is_responsavel = validated_data.pop('is_responsavel', False)
        aluno_cpf = validated_data.pop('aluno_cpf', None)
        password = validated_data.pop('password', None)

        with transaction.atomic():
            # Cria o Usuario
            # Se UsuarioManager.create_user() é usado:
            if password:
                user = Usuario.objects.create_user(**validated_data, password=password)
            else:
                user = Usuario.objects.create(**validated_data)
                user.set_password("Teste123") # Senha padrão
                user.save(update_fields=['password'])

            # Lógica para Responsável
            if is_responsavel:
                # Importa o ResponsavelSerializer aqui para evitar import circular no topo
                # e para garantir que ele seja usado apenas quando necessário.
                from .responsavel_serializer import ResponsavelCreateUpdateSerializer 

                try:
                    # Busca o Aluno pelo CPF do usuário associado
                    aluno = Aluno.objects.get(usuario__cpf=aluno_cpf)
                except Aluno.DoesNotExist:
                    raise serializers.ValidationError({"aluno_cpf": "Aluno com o CPF fornecido não encontrado."})
                except Exception as e:
                    raise serializers.ValidationError(f"Erro ao buscar aluno: {e}")

                # Prepara os dados para o ResponsavelSerializer
                responsavel_data = {
                    'usuario': user.id, # Passa o ID do usuário recém-criado
                    'aluno': aluno.id   # Passa o ID do aluno encontrado
                }
                
                # Instancia e valida o ResponsavelSerializer
                responsavel_serializer = ResponsavelCreateUpdateSerializer(data=responsavel_data)
                responsavel_serializer.is_valid(raise_exception=True)
                responsavel_serializer.save() # Cria o objeto Responsavel

                # O model Responsavel.save() agora se encarregará de atualizar user.tipo_usuario
                # para 'RESPONSAVEL' e user.status_usuario para 'EM_ANALISE'.
                
            else:
                # Se não é responsável, defina o tipo_usuario como 'EXTERNO' explicitamente.
                if user.tipo_usuario != 'EXTERNO':
                    user.tipo_usuario = 'EXTERNO'
                    user.save(update_fields=['tipo_usuario'])
                    
        return user


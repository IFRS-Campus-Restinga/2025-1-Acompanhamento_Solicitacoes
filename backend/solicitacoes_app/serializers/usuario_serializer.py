from rest_framework import serializers
from ..models import Usuario, Aluno, Responsavel # Seus modelos já devem estar aqui
from django.contrib.auth.models import Group
from django.db import transaction


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
    is_responsavel = serializers.BooleanField(write_only=True, required=False, default=False)
    aluno_cpf = serializers.CharField(write_only=True, required=False, max_length=11, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'cpf', 'telefone', 'data_nascimento', 'password', 'is_responsavel', 'aluno_cpf']
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
        # --- AQUI ESTÁ A MUDANÇA MÍNIMA E ESSENCIAL ---
        # Remova temporariamente 'is_responsavel' e 'aluno_cpf' para a validação do modelo Usuario
        is_responsavel = data.pop('is_responsavel', False)
        aluno_cpf = data.pop('aluno_cpf', None)
        # -----------------------------------------------

        # Validações de unicidade de email e CPF (copiadas do UsuarioSerializer, se este for o único de escrita)
        email = data.get('email')
        if email and Usuario.objects.filter(email=email).exists():
            # --- Adicionado: Coloque os campos de volta se a validação falhar antes de re-lançar ---
            data['is_responsavel'] = is_responsavel
            data['aluno_cpf'] = aluno_cpf
            raise serializers.ValidationError({"email": "Este email já está em uso."})
        
        cpf = data.get('cpf')
        if cpf and Usuario.objects.filter(cpf=cpf).exists():
            # --- Adicionado: Coloque os campos de volta se a validação falhar antes de re-lançar ---
            data['is_responsavel'] = is_responsavel
            data['aluno_cpf'] = aluno_cpf
            raise serializers.ValidationError({"cpf": "Este CPF já está em uso."})

        if is_responsavel and not aluno_cpf:
            # --- Adicionado: Coloque os campos de volta se a validação falhar antes de re-lançar ---
            data['is_responsavel'] = is_responsavel # Já é True, mas para manter a consistência
            data['aluno_cpf'] = aluno_cpf # Já é None, mas para manter a consistência
            raise serializers.ValidationError({"aluno_cpf": "O CPF do aluno é obrigatório para um Responsável."})
        
        # Executa as validações do model (incluindo validar_cpf, validar_idade)
        temp_instance = Usuario(**data) # Agora 'data' não conterá 'is_responsavel' nem 'aluno_cpf'
        if not data.get('password'): 
            temp_instance.password = "dummy" 
        try:
            temp_instance.full_clean(exclude=['password']) 
        except Exception as e:
            # --- Adicionado: Coloque os campos de volta antes de re-lançar a exceção ---
            data['is_responsavel'] = is_responsavel
            data['aluno_cpf'] = aluno_cpf
            raise serializers.ValidationError(e.message_dict)

        # --- RE-ADICIONE os campos de volta ao 'data' para que eles estejam presentes para o método create() ---
        data['is_responsavel'] = is_responsavel
        data['aluno_cpf'] = aluno_cpf
        # ------------------------------------------------------------------------------------------

        return data

    def create(self, validated_data):
        is_responsavel = validated_data.pop('is_responsavel', False)
        aluno_cpf = validated_data.pop('aluno_cpf', None)
        password = validated_data.pop('password', None)

        with transaction.atomic():
            # Cria o Usuario
            if password:
                user = Usuario.objects.create_user(**validated_data, password=password)
            else:
                user = Usuario.objects.create(**validated_data)
                user.set_password("Teste123") # Senha padrão
                user.save(update_fields=['password'])

            # Lógica para Responsável
            if is_responsavel:
                # Não é necessário importar ResponsavelCreateUpdateSerializer aqui.
                # Criamos o Responsavel diretamente.
                try:
                    # Busca o Aluno pelo CPF do usuário associado
                    aluno = Aluno.objects.get(usuario__cpf=aluno_cpf)
                except Aluno.DoesNotExist:
                    raise serializers.ValidationError({"aluno_cpf": "Aluno com o CPF fornecido não encontrado."})
                except Exception as e:
                    raise serializers.ValidationError(f"Erro ao buscar aluno: {e}")

                # --- NOVO CÓDIGO PARA CRIAR/ACESSAR O RESPONSÁVEL ---
                # A OneToOneField com primary_key=True significa que o ID do Responsavel
                # será o mesmo do Usuario. Usamos get_or_create para garantir unicidade.
                responsavel, created = Responsavel.objects.get_or_create(usuario=user, defaults={'aluno': aluno})
                
                if not created:
                    # Se o responsável já existia (o que não deveria para um usuário recém-criado),
                    # verifica e atualiza o aluno se for diferente.
                    if responsavel.aluno != aluno:
                        responsavel.aluno = aluno
                        responsavel.save(update_fields=['aluno'])
                    print(f"Responsável para {user.email} já existia e foi atualizado (se necessário).")
                else:
                    print(f"Responsável para {user.email} criado com sucesso.")

                # Adiciona o usuário ao grupo 'responsavel'
                try:
                    responsavel_group = Group.objects.get(name='responsavel')
                    user.groups.add(responsavel_group)
                    print(f"Usuário {user.email} adicionado ao grupo 'responsavel'.")
                except Group.DoesNotExist:
                    print("AVISO: Grupo 'responsavel' não encontrado. Usuário não adicionado ao grupo.")
                # --- FIM DO NOVO CÓDIGO ---
                    
        return user


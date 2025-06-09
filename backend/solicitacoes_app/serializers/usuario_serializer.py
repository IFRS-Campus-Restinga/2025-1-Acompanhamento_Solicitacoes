from rest_framework import serializers
from ..models import Usuario, Aluno, Responsavel 
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
        instance = getattr(self, 'instance', None)
        if instance and instance.email == value:
            return value
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value
    
    def validate_cpf(self, value):
        if not value:
            return value
        instance = getattr(self, 'instance', None)
        if instance and instance.cpf == value:
            return value
        if Usuario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso.")
        return value
    
    def validate(self, data):
        instance = self.instance or self.Meta.model(**data)
        instance.password = "Teste123" # Assumindo senha padrão para full_clean
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
            aluno = obj.responsavel.aluno
            return {
                "id": obj.responsavel.id,
                "aluno": aluno.usuario.nome if aluno else None,
                "email_aluno": aluno.usuario.email if aluno else None 
            }
        return None
    
    def validate(self, data):
        instance = self.instance or self.Meta.model(**data)
        instance.password = "Teste123" # Assumindo senha padrão para full_clean
        instance.full_clean() 
        return data

class UsuarioWriteSerializer(serializers.ModelSerializer):
    # Campos customizados para o fluxo de "Responsável"
    is_responsavel = serializers.BooleanField(write_only=True, required=False, default=False)
    aluno_cpf = serializers.CharField(write_only=True, required=False, max_length=14, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=False)

    # --- AQUI ESTÁ A CLASSE META, QUE DEVE ESTAR PRESENTE ---
    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'cpf', 'telefone', 'data_nascimento', 'password', 'is_responsavel', 'aluno_cpf']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False} 
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Qualquer customização do seu colega aqui.

    def validate(self, data):
        _is_responsavel = data.pop('is_responsavel', False)
        _aluno_cpf = data.pop('aluno_cpf', None)
        
        _temp_aluno_id_for_responsavel = None

        email = data.get('email')
        if email and Usuario.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Este email já está em uso."})
        
        cpf = data.get('cpf')
        if cpf and Usuario.objects.filter(cpf=cpf).exists():
            raise serializers.ValidationError({"cpf": "Este CPF já está em uso."})

        if _is_responsavel:
            if not _aluno_cpf:
                raise serializers.ValidationError({"aluno_cpf": "O CPF do aluno é obrigatório para um Responsável."})
            
            aluno_cpf_limpo = ''.join(filter(str.isdigit, _aluno_cpf))
            if len(aluno_cpf_limpo) != 11:
                raise serializers.ValidationError({"aluno_cpf": "CPF do aluno inválido. Deve conter 11 dígitos numéricos."})

            try:
                aluno_usuario = Usuario.objects.get(cpf=aluno_cpf_limpo, aluno__isnull=False)
                _temp_aluno_id_for_responsavel = aluno_usuario.aluno.id 
                print(f"VALIDATE: Aluno encontrado para Responsável. ID do aluno: {_temp_aluno_id_for_responsavel}")
            except Usuario.DoesNotExist:
                print(f"VALIDATE: Erro - Aluno com CPF {_aluno_cpf} não encontrado ou não é um aluno.")
                raise serializers.ValidationError({"aluno_cpf": "Aluno com o CPF fornecido não encontrado ou não é um aluno."})
        else:
            if _aluno_cpf:
                 raise serializers.ValidationError({"aluno_cpf": "CPF de aluno não deve ser fornecido para um usuário que não é Responsável."})

        data_for_full_clean = data.copy()
        
        temp_instance = Usuario(**data_for_full_clean)
        if not data_for_full_clean.get('password'): 
            temp_instance.password = "dummy_password_for_validation"
        try:
            temp_instance.full_clean(exclude=['password']) 
        except Exception as e:
            data['is_responsavel'] = _is_responsavel
            data['aluno_cpf'] = _aluno_cpf
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            else:
                raise serializers.ValidationError({"detalhe": str(e)})

        data['is_responsavel'] = _is_responsavel
        data['aluno_cpf'] = _aluno_cpf
        if _temp_aluno_id_for_responsavel is not None:
            data['aluno_id_for_responsavel'] = _temp_aluno_id_for_responsavel

        return data

    @transaction.atomic
    def create(self, validated_data):
        is_responsavel = validated_data.pop('is_responsavel', False)
        aluno_id_for_responsavel = validated_data.pop('aluno_id_for_responsavel', None)
        aluno_cpf = validated_data.pop('aluno_cpf', None) 
        password = validated_data.pop('password', None)

        if password:
            user = Usuario.objects.create_user(**validated_data, password=password)
        else:
            user = Usuario.objects.create(**validated_data)
            user.set_password("Teste123")
            user.save(update_fields=['password'])

        if is_responsavel:
            if not aluno_id_for_responsavel:
                raise serializers.ValidationError({"aluno_id_for_responsavel": "ID do aluno responsável não foi fornecido para criar Responsável."})
            
            try:
                responsavel, created = Responsavel.objects.get_or_create(usuario=user, defaults={'aluno_id': aluno_id_for_responsavel})
                if not created:
                    if responsavel.aluno_id != aluno_id_for_responsavel:
                        responsavel.aluno_id = aluno_id_for_responsavel
                        responsavel.save(update_fields=['aluno'])
                
                print(f"CREATE: Instância de Responsavel para {user.email} (CPF Aluno: {aluno_cpf}) criada/atualizada.")

                responsavel_group, created_group = Group.objects.get_or_create(name='responsavel')
                user.groups.add(responsavel_group)
                print(f"CREATE: Usuário {user.email} adicionado ao grupo 'responsavel'.")

            except Exception as e:
                print(f"CREATE: Erro ao criar registro de Responsável ou adicionar grupo: {e}")
                raise serializers.ValidationError(f"Erro ao criar registro de Responsável ou associar grupo: {e}")

        return user
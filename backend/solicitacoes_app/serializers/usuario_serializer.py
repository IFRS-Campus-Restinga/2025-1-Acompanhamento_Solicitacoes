from rest_framework import serializers
from ..models import Usuario, Coordenador, CRE, Aluno, Responsavel


class UsuarioSerializer(serializers.ModelSerializer):
    
    papel = serializers.SerializerMethodField()
    papel_detalhes = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nome', 'cpf', 'telefone', 'data_nascimento', 'is_active', 'papel', 'papel_detalhes']
        read_only_fields = ['id']
    
    def get_papel(self, obj):
        # Verificando os papéis baseados nos campos relacionados do usuário
        if hasattr(obj, 'coordenador') and obj.coordenador:
            return 'Coordenador'
        elif hasattr(obj, 'aluno') and obj.aluno:
            return 'Aluno'
        elif hasattr(obj, 'cre') and obj.cre:
            return 'CRE'
        elif hasattr(obj, 'responsavel') and obj.responsavel:
            return 'Responsável'
        return '-'
    
    
    def get_papel_detalhes(self, obj):
        # Importação tardia para evitar importação circular
        if hasattr(obj, 'aluno'):
            from .aluno_serializer import AlunoSerializer
            return AlunoSerializer(obj.aluno).data
        elif hasattr(obj, 'coordenador'):
            from .coordenador_serializer import CoordenadorSerializer
            return CoordenadorSerializer(obj.coordenador).data
        elif hasattr(obj, 'cre'):
            from .cre_serializer import CRESerializer
            return CRESerializer(obj.cre).data
        #elif hasattr(obj, 'responsavel'):
         #   from .responsavel_serializer import ResponsavelSerializer
          #  return ResponsavelSerializer(obj.responsavel).data
        return None
    
    
    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.full_clean() 
        return data


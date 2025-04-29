from rest_framework import serializers
from ..models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    papel = serializers.SerializerMethodField()
    papel_detalhes = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'cpf', 'telefone', 'data_nascimento',
            'is_active', 'papel', 'papel_detalhes'
        ]
    
    def get_papel(self, obj):
        if hasattr(obj, 'coordenador'):
            return "Coordenador"
        if hasattr(obj, 'aluno'):
            return "Aluno"
        if hasattr(obj, 'cre'):
            return "CRE"
        if hasattr(obj, 'responsavel'):
            return "Responsavel"
        return "-"
    
    def get_papel_detalhes(self, obj):
        if hasattr(obj, 'coordenador'):
            coordenador = obj.coordenador
            return {
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
                "matricula": aluno.matricula,
                "turma": aluno.turma,
                "ano_ingresso": aluno.ano_ingresso
            }
        
        if hasattr(obj, 'cre'):
            cre = obj.cre
            return {
                "siape": cre.siape
            }
        if hasattr(obj, 'responsavel'):
            responsavel = obj.responsavel
            return {
                "aluno": responsavel.aluno.usuario.nome
            }
        return None
    
    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.password = "Teste123"
        instance.full_clean() 
        return data


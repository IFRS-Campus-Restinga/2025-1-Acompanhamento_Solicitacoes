from rest_framework import serializers
from ..models import Solicitacao

# ALTERADO: O nome da classe base agora é `SolicitacaoSerializer`, como você pediu.
class SolicitacaoSerializer(serializers.ModelSerializer):
    """
    Esta é a CLASSE BASE para todos os serializers de solicitação.
    Ela define os campos e lógicas comuns e será herdada pelos 7 serializers
    específicos de cada formulário.
    """
    nome_aluno = serializers.CharField(source='aluno.usuario.nome', read_only=True)
    tipo_formulario = serializers.CharField(source='_meta.verbose_name', read_only=True)
    
    class Meta:
        model = Solicitacao
        fields = [
            'id', 
            'aluno',
            'nome_aluno',
            'tipo_formulario',
            'posse_solicitacao', 
            'data_solicitacao', 
            'data_emissao', 
            'status'
        ]
        read_only_fields = fields
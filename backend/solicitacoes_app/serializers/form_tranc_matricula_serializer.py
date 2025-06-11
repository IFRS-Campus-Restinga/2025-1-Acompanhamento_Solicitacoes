from ..models import FormularioTrancamentoMatricula
# ALTERADO: Importe a sua classe base SolicitacaoSerializer.
from .solicitacao_serializer import SolicitacaoSerializer

# ALTERADO: A classe agora herda da sua base para receber os campos comuns.
class FormularioTrancamentoMatriculaSerializer(SolicitacaoSerializer):
    """
    Serializer ATUALIZADO para o Formulário de Trancamento de Matrícula.
    Ele herda de SolicitacaoSerializer e apenas adiciona seus campos exclusivos.
    """
    class Meta(SolicitacaoSerializer.Meta):
        # A Meta também herda da base.
        model = FormularioTrancamentoMatricula
        
        # Adicionamos o campo específico deste formulário aos campos da base.
        fields = SolicitacaoSerializer.Meta.fields + ['motivo_solicitacao']

    # REMOVIDO: O método create() é desnecessário.
    # A herança de ModelSerializer (através da nossa base) já fornece
    # uma implementação padrão e segura para criar a instância.
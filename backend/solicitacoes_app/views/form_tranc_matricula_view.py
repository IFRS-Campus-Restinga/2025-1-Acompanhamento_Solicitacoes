from rest_framework import generics
from ..models import FormularioTrancamentoMatricula
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from ..permissoes import CanSubmitTrancMatricula, CanViewSolicitacaoDetail

# ALTERADO: A view de criação agora é uma `CreateAPIView`.
# É mais específica e segura para um endpoint que só deve criar.
class FormTrancamentoMatriculaCreateView(generics.CreateAPIView):
    """
    Endpoint para CRIAR uma nova solicitação do tipo "Trancamento de Matrícula".
    """
    # queryset é necessário, mas como não vamos listar nada, pode ser .none()
    queryset = FormularioTrancamentoMatricula.objects.none()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [CanSubmitTrancMatricula]

    # REMOVIDO: O método create() foi removido.
    # A classe genérica `CreateAPIView` já implementa toda a lógica de
    # validação, salvamento e retorno de resposta HTTP de forma otimizada.
    # Manter a implementação padrão é mais limpo e seguro.


# NENHUMA ALTERAÇÃO NECESSÁRIA AQUI.
# Esta view já estava correta para ver/atualizar/deletar um item específico.
class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [CanViewSolicitacaoDetail] 
    lookup_field = "id"
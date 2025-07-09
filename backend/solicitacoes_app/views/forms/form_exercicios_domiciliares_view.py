from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated

# Importamos os modelos e serializers necessários
from ...models import FormExercicioDomiciliar, Aluno
from ...serializers.forms.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer

# Importamos as permissões específicas
from ...permissoes import CanSubmitExercicioDomiciliar, CanViewSolicitacaoDetail

# =================================================================================
# VIEW PARA LISTAR E CRIAR FORMULÁRIOS
# Substitui a necessidade de um ViewSet para as ações 'list' e 'create'.
# =================================================================================
class FormExercicioDomiciliarListCreateView(generics.ListCreateAPIView):
    """
    Lista (GET) e Cria (POST) solicitações de Exercícios Domiciliares.
    A listagem pode ser filtrada por aluno_id via query param.
    Ex: /api/formularios/exercicios-domiciliares/?aluno_id=1
    """
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [IsAuthenticated, CanSubmitExercicioDomiciliar]

    def get_queryset(self):
        """
        Filtra o queryset para retornar apenas as solicitações de um aluno específico
        se 'aluno_id' for fornecido como um parâmetro de consulta na URL.
        Caso contrário, retorna todos os formulários.
        """
        queryset = FormExercicioDomiciliar.objects.all()
        aluno_id = self.request.query_params.get('aluno_id', None)
        if aluno_id is not None:
            queryset = queryset.filter(aluno__id=aluno_id)
        return queryset.order_by('-data_solicitacao')

    def perform_create(self, serializer):
        """
        Injeta o aluno logado e o nome do formulário ao salvar, garantindo
        que a solicitação seja associada ao usuário correto.
        """
        try:
            aluno = Aluno.objects.get(usuario=self.request.user)
            serializer.save(aluno=aluno, nome_formulario='EXERCICIOSDOMICILIARES')
        except Aluno.DoesNotExist:
            raise serializers.ValidationError("Usuário logado não possui um perfil de aluno associado.")

# =================================================================================
# VIEW PARA DETALHAR, ATUALIZAR E DELETAR UM FORMULÁRIO
# Substitui a necessidade de um ViewSet para as ações 'retrieve', 'update' e 'destroy'.
# =================================================================================
class FormExercicioDomiciliarRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vê detalhes (GET), Atualiza (PUT/PATCH) e Deleta (DELETE) um formulário
    de Exercícios Domiciliares específico pelo seu ID.
    """
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'
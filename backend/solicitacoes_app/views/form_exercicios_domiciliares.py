from rest_framework import viewsets, permissions
from ..models import FormExercicioDomiciliar
from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from ..permissoes import CanSubmitExercicioDomiciliar, CanViewSolicitacaoDetail

class FormExercicioDomiciliarViewSet(viewsets.ModelViewSet):
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Sobescreve get_queryset para buscar formulário vinculado ao aluno
        """
        try:
            return FormExercicioDomiciliar.objects.get(aluno=self.kwargs['id'])
        except KeyError:
            return FormExercicioDomiciliar.objects.all()
        except FormExercicioDomiciliar.DoesNotExist:
            return ({"message":"Não existe formulário vinculado ao aluno"})
    #editei aqui
    def get_permissions(self):
        """
        Define permissões diferentes para diferentes ações:
        - Para criar: CanSubmitExercicioDomiciliar
        - Para visualizar/editar/excluir: CanViewSolicitacaoDetail
        """
        if self.action == 'create':
            permission_classes = [CanSubmitExercicioDomiciliar]
        else:
            permission_classes = [CanViewSolicitacaoDetail]
        return [permission() for permission in permission_classes]

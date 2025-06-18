from rest_framework import viewsets, permissions

from ..permissoes import CanSubmitExercicioDomiciliar, CanViewSolicitacaoDetail
from ..models import FormExercicioDomiciliar
from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from ..permissoes import CanSubmitExercicioDomiciliar, CanViewSolicitacaoDetail
from rest_framework import generics

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


class FormExercicioDomiciliarGetView(generics.ListAPIView):
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Overrides get_queryset to search for a form linked to a student.
        It now expects 'aluno_id' as a query parameter.
        Returns an empty queryset if no form is found for the given aluno_id,
        or all forms if no aluno_id is provided.
        """
        # Start with all objects
        queryset = FormExercicioDomiciliar.objects.all()

        # Try to get 'aluno_id' from query parameters (e.g., /form_exerc_dom/?aluno_id=123)
        aluno_id = self.request.query_params.get('aluno_id', None)

        if aluno_id is not None:
            # Filter the queryset by the aluno_id.
            # Use aluno__id if 'aluno' is a ForeignKey to an Aluno model.
            queryset = queryset.filter(aluno__id=aluno_id)
            
            # OPTIONAL: If you strictly expect only ONE form per student,
            # and want to return only that one (not a list), you might consider
            # fetching the single object here and serializing it.
            # However, for a ListAPIView, returning a filtered queryset is standard.
            # If you *only* want one object and raise 404 if not found, a RetrieveAPIView
            # (or a custom action as discussed before) is more appropriate.
            # For a ListAPIView, if the filter returns no results, it returns an empty list `[]`.
            
        return queryset

    # Removed the get_permissions method if you're not overriding it beyond permissions.IsAuthenticated
    # If CanSubmitExercicioDomiciliar or CanViewSolicitacaoDetail are still needed,
    # you might need to reconsider if ListAPIView is the best fit or if these
    # permissions apply universally to this view.

class FormularioExercDomUdpate(generics.UpdateAPIView):
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FormExercicioDomiciliar
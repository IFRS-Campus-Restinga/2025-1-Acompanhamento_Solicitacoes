from rest_framework import generics, serializers
from ...models.forms.form_interprete_libras import FormInterpreteLibras
from rest_framework.permissions import IsAuthenticated
from ...models.aluno import Aluno
from ...serializers.forms.form_interprete_libras_serializer import FormInterpreteLibrasSerializer


class FormInterpreteLibrasListCreateView(generics.ListCreateAPIView):
    serializer_class = ""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FormInterpreteLibras.objects.all()
        aluno_id = self.request.query_params.get('aluno_id', None)
        if aluno_id is not None:
            queryset = queryset.filter(aluno__id=aluno_id)
        return queryset.order_by('-data_solicitacao')

    def perform_create(self, serializer):
        try:
            aluno = Aluno.objects.get(usuario=self.request.user)
            serializer.save(aluno=aluno, nome_formulario="INTERPRETELIBRAS")
        except Aluno.DoesNotExist:
            raise serializer.ValidationError("Usuário logado não possui um perfil de aluno associado.")
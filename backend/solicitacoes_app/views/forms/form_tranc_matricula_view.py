from rest_framework import generics, status, serializers
from rest_framework.permissions import AllowAny
from ...models import FormularioTrancamentoMatricula, Aluno
from ...serializers.forms.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from datetime import datetime
from rest_framework.response import Response
from ...permissoes import CanSubmitTrancMatricula, CanViewSolicitacaoDetail


class FormTrancamentoListCreateView(generics.ListCreateAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [CanSubmitTrancMatricula] 

    # ADICIONADO: O método perform_create para injetar o aluno.
    def perform_create(self, serializer):
        """
        Este método é chamado pelo DRF antes de salvar o objeto.
        Nós o usamos para encontrar o aluno logado e passá-lo para o serializer.
        """
        try:
            # Pega o objeto Aluno associado ao usuário que fez a requisição
            aluno = Aluno.objects.get(usuario=self.request.user)
            
            # Salva o formulário, passando o aluno encontrado como um dado extra.
            # O serializer agora terá o campo 'aluno' que ele precisa para ser salvo.
            serializer.save(aluno=aluno)
        except Aluno.DoesNotExist:
            # Levanta um erro de validação claro se o usuário não for um aluno.
            raise serializers.ValidationError("Usuário logado não possui um perfil de aluno associado.")
    def create(self, request, *args, **kwargs):
        print("🔥 [Django] Dados recebidos no POST:")
        for k, v in request.data.items():
            print(f"   📥 {k}: {v}")

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("❌ Erros de validação:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        print("✅ Dados validados. Salvando...")
        # Esta chamada agora vai acionar o nosso perform_create customizado acima.
        self.perform_create(serializer)

        print("✅ Salvo com sucesso!")
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class FormTrancamentoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanViewSolicitacaoDetail] 
    lookup_field = "id"

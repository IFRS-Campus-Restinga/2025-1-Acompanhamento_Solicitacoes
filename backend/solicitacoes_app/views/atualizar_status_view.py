from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from solicitacoes_app.models import Solicitacao, Status
from solicitacoes_app.serializers.solicitacao_serializer import SolicitacaoSerializer

class AtualizarStatusSolicitacaoView(UpdateAPIView):
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
    lookup_field = "id"  # Define que o parâmetro `id` será usado para buscar a solicitação

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        novo_status = request.data.get("status")

        # Valida se o status enviado está dentro das opções permitidas
        if novo_status not in dict(Status.choices).values():
            return Response({"erro": "Status inválido."}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = novo_status
        instance.save()

        return Response({"mensagem": f"Status atualizado para: {novo_status}"}, status=status.HTTP_200_OK)

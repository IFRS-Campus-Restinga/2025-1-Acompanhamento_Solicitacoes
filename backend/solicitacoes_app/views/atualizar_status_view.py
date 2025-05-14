from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from solicitacoes_app.models import Solicitacao, Status
from solicitacoes_app.serializers.solicitacao_serializer import SolicitacaoSerializer

class AtualizarStatusSolicitacaoView(UpdateAPIView):
    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        novo_status = request.data.get("status")

        # Valida se o status enviado está dentro das opções permitidas
        if novo_status not in dict(Status.choices).values():
            return Response({"erro": "Status inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # Atualiza posse_solicitacao conforme a etapa do processo
        if novo_status == Status.EM_ANALISE:
            instance.posse_solicitacao = "Coordenador"
        elif novo_status == Status.EM_EMISSAO:
            instance.posse_solicitacao = "CRE"
        elif novo_status == Status.APROVADO:
            instance.posse_solicitacao = "Aluno"

        instance.status = novo_status
        instance.save()

        return Response({"mensagem": f"Status atualizado para: {novo_status}, responsável agora é {instance.posse_solicitacao}"}, status=status.HTTP_200_OK)

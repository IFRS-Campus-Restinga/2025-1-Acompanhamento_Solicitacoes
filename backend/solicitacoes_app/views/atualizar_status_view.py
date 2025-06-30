from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

# Importamos os modelos e a classe de Status
from ..models import (
    Status,
    PosseSolicitacao,
    FormularioTrancamentoMatricula,
    FormTrancDisciplina,
    FormAbonoFalta,
    FormExercicioDomiciliar,
    FormDispensaEdFisica,
    FormEntregaAtivCompl
)
from ..permissoes import IsCRE, CanRespondSolicitacao # Importa a permissão CanRespondSolicitacao

# ADICIONADO: Um "mapa" para encontrar o modelo correto a partir da chave na URL
MODEL_MAP = {
    'trancamento-matricula': FormularioTrancamentoMatricula,
    'trancamento-disciplina': FormTrancDisciplina,
    'abono-falta': FormAbonoFalta,
    'exercicios-domiciliares': FormExercicioDomiciliar,
    'dispensa-ed-fisica': FormDispensaEdFisica,
    'entrega-ativ-compl': FormEntregaAtivCompl,
}

class AtualizarStatusSolicitacaoView(APIView):
    """
    View para atualizar o status e a posse de qualquer tipo de solicitação.
    Recebe o tipo e o id do formulário pela URL.
    """
    permission_classes = [IsAuthenticated, CanRespondSolicitacao] # Permissão para responder solicitações

    def patch(self, request, form_type_key, pk, format=None):
        model_class = MODEL_MAP.get(form_type_key)
        if not model_class:
            return Response({"erro": "Tipo de formulário inválido."}, status=status.HTTP_404_NOT_FOUND)
        instance = get_object_or_404(model_class, pk=pk)

        # Verifica a permissão a nível de objeto antes de prosseguir
        self.check_object_permissions(request, instance)

        novo_status = request.data.get("status")

        status_keys = [choice[0] for choice in Status.choices]
        if novo_status not in status_keys:
            return Response({"erro": "Status inválido fornecido."}, status=status.HTTP_400_BAD_REQUEST)

        if novo_status == Status.DEFERIDO or novo_status == Status.INDEFERIDO:
            instance.posse_solicitacao = PosseSolicitacao.ALUNO
        elif novo_status == Status.EM_ANALISE:
            instance.posse_solicitacao = PosseSolicitacao.COORDENACAO

        instance.status = novo_status
        instance.save(update_fields=['status', 'posse_solicitacao']) # Otimiza o save

        return Response({
            "mensagem": f"Status da solicitação {instance.id} atualizado para '{instance.get_status_display()}'."
        }, status=status.HTTP_200_OK)



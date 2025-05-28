from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from solicitacoes_app.models import Solicitacao

from solicitacoes_app.serializers.form_abono_falta_serializer import FormAbonoFaltaSerializer
from solicitacoes_app.serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from solicitacoes_app.serializers.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer
from solicitacoes_app.serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from solicitacoes_app.serializers.form_desistencia_vaga_serializer import FormDesistenciaVagaSerializer
from solicitacoes_app.serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from solicitacoes_app.serializers.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer

SERIALIZER_MAP = {
    'Trancamento de Disciplina': FormTrancDisciplinaSerializer,
    'Trancamento de Matrícula': FormularioTrancamentoMatriculaSerializer,
    'Dispensa de Educação Física': FormDispEdFisicaSerializer,
    'Desistência de Vaga': FormDesistenciaVagaSerializer,
    'Exercícios Domiciliares': FormExercicioDomiciliarSerializer,
    'Abono de Faltas': FormAbonoFaltaSerializer,
    'Entrega de Certificados': FormEntregaAtivComplSerializer, 
}

class DetalhesFormularioView(RetrieveAPIView):
    """
    View para retornar os detalhes de uma solicitação específica,
    usando o serializer apropriado com base no campo 'nome_formulario'.
    """
    queryset = Solicitacao.objects.all() 
    lookup_url_kwarg = 'solicitacao_id' 

    def get_serializer_class(self):
        """
        Determina qual classe de serializer usar com base no
        campo 'nome_formulario' da instância de Solicitacao.
        """
     
        solicitacao = get_object_or_404(
            Solicitacao,
            id=self.kwargs[self.lookup_url_kwarg]
        )

        # Obtém o tipo de formulário diretamente do campo 'nome_formulario'.
        tipo_formulario = solicitacao.nome_formulario

        # Busca o serializer correspondente no mapa atualizado.
        serializer_class = SERIALIZER_MAP.get(tipo_formulario)

        # Verifica se um serializer foi encontrado para o tipo.
        if not serializer_class:
            raise ValueError(
                f"Serializer para o tipo de formulário '{tipo_formulario}' não encontrado no SERIALIZER_MAP."
            )

        return serializer_class

    


from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from solicitacoes_app.permissoes import CanViewSolicitacaoDetail # Corrigido para 'permissions'
from django.apps import apps # Importar apps para buscar modelos dinamicamente
from django.http import Http404

# Importar todos os modelos de formulário concretos
from solicitacoes_app.models.forms.form_abono_falta import FormAbonoFalta
from solicitacoes_app.models.forms.form_exercicio_domiciliar import FormExercicioDomiciliar
from solicitacoes_app.models.forms.form_dispensa_ed_fisica import FormDispensaEdFisica
from solicitacoes_app.models.forms.form_tranc_disciplina import FormTrancDisciplina
from solicitacoes_app.models.forms.form_desistencia_vaga import FormDesistenciaVaga
from solicitacoes_app.models.forms.form_tranc_matricula import FormularioTrancamentoMatricula
from solicitacoes_app.models.forms.form_entrega_ativ_compl import FormEntregaAtivCompl

# Importar os serializers correspondentes
from solicitacoes_app.serializers.form_abono_falta_serializer import FormAbonoFaltaSerializer
from solicitacoes_app.serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from solicitacoes_app.serializers.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer
from solicitacoes_app.serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from solicitacoes_app.serializers.form_desistencia_vaga_serializer import FormDesistenciaVagaSerializer
from solicitacoes_app.serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from solicitacoes_app.serializers.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer

# Mapeamento do nome do formulário para o MODELO CONCRETO e o SERIALIZER
FORM_MODEL_MAP = {
    'Trancamento de Disciplina': {'model': FormTrancDisciplina, 'serializer': FormTrancDisciplinaSerializer},
    'Trancamento de Matrícula': {'model': FormularioTrancamentoMatricula, 'serializer': FormularioTrancamentoMatriculaSerializer},
    'Dispensa de Educação Física': {'model': FormDispensaEdFisica, 'serializer': FormDispEdFisicaSerializer},
    'Desistência de Vaga': {'model': FormDesistenciaVaga, 'serializer': FormDesistenciaVagaSerializer},
    'Exercícios Domiciliares': {'model': FormExercicioDomiciliar, 'serializer': FormExercicioDomiciliarSerializer},
    'Abono de Faltas': {'model': FormAbonoFalta, 'serializer': FormAbonoFaltaSerializer},
    'Entrega de Certificados': {'model': FormEntregaAtivCompl, 'serializer': FormEntregaAtivComplSerializer},
    'Entrega de Atividades Complementares': {'model': FormEntregaAtivCompl, 'serializer': FormEntregaAtivComplSerializer}, # Adicionado para consistência
}

class DetalhesFormularioView(RetrieveAPIView):
    """
    View para retornar os detalhes de uma solicitação específica,
    usando o serializer apropriado com base no campo 'nome_formulario'.
    """
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    # Não definimos queryset aqui, pois ele será determinado dinamicamente em get_object
    lookup_url_kwarg = 'solicitacao_id'

    def get_object(self):
        solicitacao_id = self.kwargs[self.lookup_url_kwarg]

        # Primeiro, tentamos encontrar a solicitação em cada modelo concreto
        # Isso é necessário porque Solicitacao é abstrata e não tem .objects
        for form_type, mapping in FORM_MODEL_MAP.items():
            model = mapping['model']
            try:
                # Tenta buscar o objeto no modelo concreto atual
                obj = model.objects.get(pk=solicitacao_id)
                # Se encontrado, verifica se o nome_formulario corresponde (opcional, mas boa prática)
                # Nota: O nome_formulario no modelo Solicitacao é um CharField com choices, então o valor salvo
                # será a chave (ex: 'TRANCAMENTODISCIPLINA'), não o label (ex: 'Trancamento de Disciplina').
                # Precisamos comparar com a chave ou garantir que o mapa use as chaves.
                # Para simplificar agora, vamos assumir que o nome_formulario no banco é o label.
                # Se não for, você precisará ajustar o FORM_MODEL_MAP para usar as chaves.
                if obj.get_nome_formulario_display() == form_type: # Usa get_nome_formulario_display para comparar com o label
                    self.queryset = model.objects.all() # Define o queryset para a permissão de objeto
                    return obj
            except model.DoesNotExist:
                continue # Continua procurando em outros modelos
        
        # Se não encontrou em nenhum modelo concreto, levanta 404
        raise Http404("Solicitação não encontrada ou tipo de formulário inválido.")

    def get_serializer_class(self):
        """
        Determina qual classe de serializer usar com base no
        campo 'nome_formulario' da instância de Solicitacao.
        """
        solicitacao = self.get_object() # Usa get_object para que a permissão de objeto seja verificada

        # Obtém o tipo de formulário diretamente do campo 'nome_formulario'.
        # Usamos get_nome_formulario_display() para obter o label, que é o que está no nosso mapa.
        tipo_formulario = solicitacao.get_nome_formulario_display()

        # Busca o serializer correspondente no mapa atualizado.
        serializer_class = FORM_MODEL_MAP.get(tipo_formulario, {}).get('serializer')

        # Verifica se um serializer foi encontrado para o tipo.
        if not serializer_class:
            raise ValueError(
                f"Serializer para o tipo de formulário '{tipo_formulario}' não encontrado no FORM_MODEL_MAP."
            )

        return serializer_class



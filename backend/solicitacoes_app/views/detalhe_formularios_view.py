from rest_framework.generics import RetrieveAPIView
from solicitacoes_app.models import Solicitacao
from solicitacoes_app.serializers.form_abono_falta_serializer import FormAbonoFaltaSerializer
from solicitacoes_app.serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from solicitacoes_app.serializers.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer
from solicitacoes_app.serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from solicitacoes_app.serializers.form_desistencia_vaga_serializer import FormDesistenciaVagaSerializer
from solicitacoes_app.serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from solicitacoes_app.serializers.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer




# Mapeamento de tipos de formulário para seus serializers
SERIALIZER_MAP = {
    "formabonofalta": FormAbonoFaltaSerializer,
    "formexerciciodomiciliar": FormExercicioDomiciliarSerializer,
    "formdispensaedfisica": FormDispEdFisicaSerializer,
    "formtrancdisciplina": FormTrancDisciplinaSerializer,
    "formdesistenciavaga": FormDesistenciaVagaSerializer,
    "formulariotrancamentomatricula": FormularioTrancamentoMatriculaSerializer,
}

class DetalhesFormularioView(RetrieveAPIView):
    def get_object(self):
        solicitacao = Solicitacao.objects.get(id=self.kwargs["solicitacao_id"])
        print("Solicitação encontrada:", solicitacao)  # Verifica se a solicitação está sendo encontrada corretamente

        formulario = solicitacao.formulario_associado
        print("Formulário associado:", formulario) 
        
        if not formulario:
            raise ValueError("Formulário não encontrado.")

        return formulario  # Retorna o objeto do formulário

    def get_serializer_class(self):
        solicitacao = Solicitacao.objects.get(id=self.kwargs["solicitacao_id"])

        tipo_formulario = solicitacao.content_type.model.lower()  # Padroniza para minúsculas
        serializer_class = SERIALIZER_MAP.get(tipo_formulario)

        if not serializer_class:
            raise ValueError("Serializer para este formulário não encontrado.")

        return serializer_class

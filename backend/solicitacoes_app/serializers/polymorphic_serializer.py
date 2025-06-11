from rest_framework import serializers
from ..models import (
    FormularioTrancamentoMatricula, FormAbonoFalta, FormDispensaEdFisica,
    FormEntregaAtivCompl, FormTrancDisciplina, FormDesistenciaVaga, FormExercicioDomiciliar, Solicitacao
)
# Importe os serializers específicos. É crucial que eles já estejam atualizados
# para herdar da sua classe base (SolicitacaoSerializer).
from . import (
    FormularioTrancamentoMatriculaSerializer, FormAbonoFaltaSerializer, FormDispEdFisicaSerializer,
    FormEntregaAtivComplSerializer, FormTrancDisciplinaSerializer, FormDesistenciaVagaSerializer,
    FormExercicioDomiciliarSerializer
)

class SolicitacaoPolymorphicSerializer(serializers.ModelSerializer):
    """
    Nosso serializer polimórfico "manual" que descobre o tipo do objeto
    e escolhe o serializer correto para representá-lo.
    """
    SERIALIZER_MAPPING = {
        FormularioTrancamentoMatricula: FormularioTrancamentoMatriculaSerializer,
        FormAbonoFalta: FormAbonoFaltaSerializer,
        FormDispensaEdFisica: FormDispEdFisicaSerializer,
        FormEntregaAtivCompl: FormEntregaAtivComplSerializer,
        FormTrancDisciplina: FormTrancDisciplinaSerializer,
        FormDesistenciaVaga: FormDesistenciaVagaSerializer,
        FormExercicioDomiciliar: FormExercicioDomiciliarSerializer,
    }

    class Meta:
        # Aponta para o modelo pai. Usamos apenas para a estrutura.
        model = Solicitacao
        # Os campos são apenas para leitura na listagem geral.
        fields = ['id', 'aluno', 'status', 'data_solicitacao'] 

    def to_representation(self, instance):
        """
        Este método é a chave. Ele é chamado pelo DRF para cada objeto.
        Nós o sobrescrevemos para usar o serializer específico do nosso mapa.
        """
        # Pega a classe real do objeto (ex: FormAbonoFalta).
        # `instance.get_real_instance_class()` é um método do django-polymorphic.
        instance_class = instance.get_real_instance_class()
        
        # Procura o serializer correspondente no mapa.
        serializer_class = self.SERIALIZER_MAPPING.get(instance_class)

        if serializer_class:
            # Se encontrou, usa esse serializer para criar a representação completa do objeto.
            return serializer_class(instance, context=self.context).data
        
        # Caso não encontre, retorna uma representação muito básica.
        return super().to_representation(instance)
from rest_framework import serializers
from ...models import FormTrancDisciplina, Disciplina
from ..solicitacao_serializer import BaseSolicitacaoModelSerializer
from django.core.exceptions import ValidationError as DjangoValidationError

class FormTrancDisciplinaSerializer(BaseSolicitacaoModelSerializer):
    disciplinas = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        many=True,
        required=True,
        pk_field=serializers.CharField()
    )
    ingressante = serializers.BooleanField(required=False, default=False)
    
    class Meta:
        model = FormTrancDisciplina
        fields = '__all__' 

    def validate(self, data):
        if self.instance is None and len(data.get('disciplinas', [])) < 1:
            raise serializers.ValidationError(
                {"disciplinas": "Selecione pelo menos 1 disciplina."}
            )

        qtd_disciplinas_selecionadas = len(data.get('disciplinas', []))
        ingressante = data.get('ingressante', False)
        limite = 2 if ingressante else 5

        if qtd_disciplinas_selecionadas > limite:
            raise serializers.ValidationError({'disciplinas': f'Alunos {"ingressantes" if ingressante else "regulares"} podem trancar no máximo {limite} disciplinas.'})

        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        data['disciplinas'] = [
            {"codigo": d.codigo, "nome": d.nome}
            for d in instance.disciplinas.all()
        ]
        return data
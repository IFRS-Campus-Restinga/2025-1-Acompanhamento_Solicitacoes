from rest_framework import serializers
from ..models import FormTrancDisciplina, Disciplina

class FormTrancDisciplinaSerializer(serializers.ModelSerializer):
    disciplinas = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        many=True,
        required=True,
        pk_field=serializers.CharField()  # Para usar 'codigo' como PK
    )
    ingressante = serializers.BooleanField(
        required=False,  # Não obrigatório (default=False)
        default=False
    )

    class Meta:
        model = FormTrancDisciplina
        fields = '__all__'
        read_only_fields = ['descricao']

    def create(self, validated_data):
        validated_data['descricao'] = (
            "Este formulário destina-se à solicitação de trancamento de um ou mais "
            "componente(s) curricular(es) do período letivo vigente."
        )
        return super().create(validated_data)

    def validate(self, data):
        if len(data.get('disciplinas', [])) < 1:
            raise serializers.ValidationError(
                {"disciplinas": "Selecione pelo menos 1 disciplina."}
            )
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['disciplinas'] = [
            {"codigo": d.codigo, "nome": d.nome}
            for d in instance.disciplinas.all()
        ]
        return data
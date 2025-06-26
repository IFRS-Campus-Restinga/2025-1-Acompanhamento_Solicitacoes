from rest_framework import serializers
from ...models.campos_solic_models.atividade_complementar import AtividadeComplementar

class AtividadeComplementarSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtividadeComplementar
        fields = ['id', 'nome', 'carga_horaria']

    def validate(self, data):
        """
        Valida se já existe uma atividade complementar com o mesmo nome e carga horária
        """
        nome = data.get('nome')
        carga_horaria = data.get('carga_horaria')
        
        if nome and carga_horaria:
            qs = AtividadeComplementar.objects.filter(
                nome__iexact=nome, 
                carga_horaria=carga_horaria
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"nome": "Já existe uma atividade complementar com este nome e carga horária."}
                )
        return data

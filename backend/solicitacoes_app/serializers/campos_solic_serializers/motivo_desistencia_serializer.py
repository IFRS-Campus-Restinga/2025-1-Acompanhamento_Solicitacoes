from rest_framework import serializers
from ...models.campos_solic_models.motivo_desistencia import MotivoDesistencia

class MotivoDesistenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivoDesistencia
        fields = ['id', 'descricao']

    def validate_descricao(self, value):
        """
        Valida se já existe um motivo com a mesma descrição (case insensitive)
        """
        qs = MotivoDesistencia.objects.filter(descricao__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Já existe um motivo de desistência com esta descrição.")
        return value

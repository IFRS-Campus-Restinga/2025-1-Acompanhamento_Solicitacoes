from rest_framework import serializers
from ..models import MotivoAbono

class MotivoAbonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivoAbono
        fields = '__all__'


    def validate_descricao(self, value):
        qs = MotivoAbono.objects.filter(descricao__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Já existe um motivo com esta descrição.")
        return value
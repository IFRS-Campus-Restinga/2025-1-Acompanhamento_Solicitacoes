from rest_framework import serializers
from ..models import MotivoAbono

class MotivoAbonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivoAbono
        fields = '__all__'

    def save(self, **kwargs):
        motivo_abono = super().save(**kwargs) 
        motivo_abono.full_clean()
        motivo_abono.save()
        return motivo_abono
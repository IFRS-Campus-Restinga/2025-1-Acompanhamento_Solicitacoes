from rest_framework import serializers
from ..models import CRE, Usuario

class CRESerializer(serializers.ModelSerializer):
    
    depth = 1

    class Meta:
        model = CRE
        fields = ['usuario', 'siape']
        
        
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')

        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)

        # Cria a CRE com o Usuario existente
        return CRE.objects.create(usuario=usuario, **validated_data)

    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.full_clean() 
        return data
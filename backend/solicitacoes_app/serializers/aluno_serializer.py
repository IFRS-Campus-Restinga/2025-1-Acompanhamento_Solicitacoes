from rest_framework import serializers
from ..models import Aluno, Usuario, Ppc
from .usuario_serializer import *
from .ppc_serializer import *

class AlunoSerializer(serializers.ModelSerializer): 
    ppc = PpcSerializer(read_only=True)
    depth=1
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        source='usuario', queryset=Usuario.objects.all(), write_only=True
    )

    class Meta:
        model = Aluno
        fields = '__all__'
    
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')

        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)

        # Cria o Aluno com o Usuario existente
        return Aluno.objects.create(usuario=usuario, **validated_data)
    
    def validate(self, data):
        if not data.get('ppc'):
            raise serializers.ValidationError({"ppc": "Um PPC deve ser selecionado."})
        return data

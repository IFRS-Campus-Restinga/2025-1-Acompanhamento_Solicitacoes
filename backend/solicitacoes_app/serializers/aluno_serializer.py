from rest_framework import serializers
from ..models import Aluno, Usuario, Ppc

class AlunoSerializer(serializers.ModelSerializer):
    
    ppc = serializers.PrimaryKeyRelatedField(queryset=Ppc.objects.all())
    depth=1
    
    class Meta:
        model = Aluno
        fields = ['usuario', 'matricula', 'ano_ingresso', 'ppc']
        
    
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

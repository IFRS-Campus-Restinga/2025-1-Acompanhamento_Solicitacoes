from rest_framework import serializers
from ..models import Responsavel, Usuario, Aluno

class ResponsavelSerializer(serializers.ModelSerializer):
    
    depth = 1

    class Meta:
        model = Responsavel
        fields = ['usuario', 'aluno']

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        aluno_data = validated_data.pop('aluno')

        # Recupera o usuário e o aluno existentes
        usuario = Usuario.objects.get(id=usuario_data.id)
        aluno = Aluno.objects.get(id=aluno_data.id)

        # Cria o Responsável com o Usuario e Aluno existentes
        return Responsavel.objects.create(usuario=usuario, aluno=aluno, **validated_data)

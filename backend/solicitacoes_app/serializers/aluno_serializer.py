from rest_framework import serializers
from .usuario_serializer import UsuarioSerializer
from ..models import Aluno

class AlunoSerializer(serializers.ModelSerializer):
    
    usuario = UsuarioSerializer()
    

    class Meta:
        model = Aluno
        fields = ['id', 'usuario', 'matricula', 'turma', 'ano_ingresso']
        
    
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        usuario, created = Usuario.objects.get_or_create(
            cpf=usuario_data['cpf'],
            defaults=usuario_data
        )
        if not created:
            for attr, value in usuario_data.items():
                setattr(usuario, attr, value)
            usuario.save()

        return Aluno.objects.create(usuario=usuario, **validated_data)
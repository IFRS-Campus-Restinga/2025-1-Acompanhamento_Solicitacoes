from rest_framework import serializers
from ..models import Curso, Aluno, Ppc
from ..serializers.usuario_serializer import UsuarioSerializer


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = ['codigo', 'nome', 'tipo_periodo']

class PpcComCursoSerializer(serializers.ModelSerializer):
    curso = CursoSerializer()
    
    class Meta:
        model = Ppc
        fields = ['codigo', 'curso']

class AlunoInfoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    ppc = PpcComCursoSerializer()
    
    class Meta:
        model = Aluno
        fields = ['id', 'matricula', 'usuario', 'ppc', 'ano_ingresso']

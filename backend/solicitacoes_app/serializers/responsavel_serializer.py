from rest_framework import serializers
from ..models import Responsavel, Usuario, Aluno # Importe Usuario e Aluno

class ResponsavelListSerializer(serializers.ModelSerializer):
    # Este serializer é para listagem, e pode usar depth=1 para expandir dados
    # se você quiser ver os detalhes de usuario e aluno ao listar responsáveis.
    # Se depth=1 é usado, não precisa de campos extras como 'usuario_nome' ou 'aluno_nome'
    # a menos que você queira renomeá-los.
    
    # Exemplo com depth=1:
    depth = 1 

    class Meta:
        model = Responsavel
        fields = ['id', 'usuario', 'aluno'] # Inclui os objetos completos de Usuario e Aluno


class ResponsavelCreateUpdateSerializer(serializers.ModelSerializer):
    # Use PrimaryKeyRelatedField para vincular a objetos existentes pelos seus IDs.
    # Isso é o que o UsuarioWriteSerializer irá passar.
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all())
    aluno = serializers.PrimaryKeyRelatedField(queryset=Aluno.objects.all())

    class Meta:
        model = Responsavel
        fields = ['usuario', 'aluno'] # Apenas os campos necessários para criar/atualizar

    # O método create() do ResponsavelSerializer que você forneceu estava bom para esta finalidade:
    def create(self, validated_data):
        # Aqui, `validated_data['usuario']` e `validated_data['aluno']` já são instâncias
        # de Usuario e Aluno devido ao PrimaryKeyRelatedField com `queryset`.
        usuario = validated_data['usuario']
        aluno = validated_data['aluno']

        # Cria o Responsável com o Usuario e Aluno existentes
        # O método save() do model Responsavel cuidará da atualização do status_usuario e tipo_usuario.
        return Responsavel.objects.create(usuario=usuario, aluno=aluno)

    # Adicione um método update se você precisar atualizar um Responsavel existente
    def update(self, instance, validated_data):
        # Aqui você pode atualizar as associações se necessário, mas geralmente
        # essas associações (usuario, aluno) não mudam após a criação.
        # Se mudar, a lógica de atualização deve ser adicionada aqui.
        return super().update(instance, validated_data)


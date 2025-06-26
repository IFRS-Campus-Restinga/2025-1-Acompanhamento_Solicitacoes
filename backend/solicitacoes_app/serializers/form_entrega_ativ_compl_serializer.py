from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import serializers
from ..models.disciplina import Disciplina
from ..models.forms.form_entrega_ativ_compl import FormEntregaAtivCompl
from .solicitacao_serializer import BaseSolicitacaoModelSerializer
from ..models.campos_solic_models.atividade_complementar import AtividadeComplementar

# Serializer para o model AtividadeComplementar novo
class AtividadeComplementarNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtividadeComplementar
        fields = ['nome', 'carga_horaria'] # Campos que o aluno preencherá

class FormEntregaAtivComplSerializer(BaseSolicitacaoModelSerializer):
    disciplinas = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Disciplina.objects.all(),
        write_only=True
    )
    atividades_complementares = AtividadeComplementarNestedSerializer(
        many=True,
        write_only=True, 
        required=False,  
        allow_empty=True # Permitir lista vazia se for opcional
    )

    # Este campo é para quando você quiser visualizar as atividades já salvas
    # pode ser útil para o GET
    atividades_complementares_info = serializers.StringRelatedField(
        many=True,
        read_only=True,
        source='atividades_complementares' # Usa o ManyToManyField existente
    )

    anexos = serializers.ListField(
        child=serializers.FileField(write_only=True),
        write_only=True,
        required=False,
        allow_empty=True
    )
    caminhos_anexos = serializers.ListField(
        child=serializers.CharField(read_only=True),
        read_only=True
    )

    class Meta:
        model = FormEntregaAtivCompl
        fields = '__all__'
        extra_kwargs = {'anexos': {'write_only': True}, 'caminhos_anexos': {'read_only': True},'atividades_complementares': {'write_only': True},}

    def create(self, validated_data):
        arquivos = validated_data.pop("anexos", [])
        atividades_complementares_data = validated_data.pop('atividades_complementares', []) # Pega os dados das atividades
        caminhos = []

        for arquivo in arquivos:
            path = default_storage.save(f'uploads/{arquivo.name}', ContentFile(arquivo.read()))
            caminhos.append(path)

        validated_data["anexos"] = caminhos  # Salva os caminhos no campo 'anexos' do modelo

        disciplinas_data = validated_data.pop('disciplinas', [])
        # form_entrega = FormEntregaAtivCompl.objects.create(**validated_data)
        # form_entrega.disciplinas.set(disciplinas_data)
        form_entrega = super().create(validated_data)
        form_entrega.disciplinas.set(disciplinas_data)

        # Processa e adiciona as atividades complementares
        for atividade_dict in atividades_complementares_data:
            # Tenta obter uma atividade existente ou cria uma nova
            atividade_obj, created = AtividadeComplementar.objects.get_or_create(
                nome=atividade_dict['nome'],
                carga_horaria=atividade_dict['carga_horaria']
            )
            form_entrega.atividades_complementares.add(atividade_obj)

        return form_entrega
    
    def update(self, instance, validated_data):

        disciplinas_data = validated_data.pop('disciplinas', None)
        atividades_complementares_data = validated_data.pop('atividades_complementares', None)
        arquivos = validated_data.pop("anexos", None) # Para lidar com novos anexos no update

        # Atualiza os campos diretos do modelo
        instance = super().update(instance, validated_data)

        # Atualiza disciplinas
        if disciplinas_data is not None:
            instance.disciplinas.set(disciplinas_data)

        # Atualiza atividades complementares
        if atividades_complementares_data is not None:
            # Primeiro, limpe as atividades existentes (ou implemente lógica de diff)
            instance.atividades_complementares.clear()
            for atividade_dict in atividades_complementares_data:
                atividade_obj, created = AtividadeComplementar.objects.get_or_create(
                    nome=atividade_dict['nome'],
                    carga_horaria=atividade_dict['carga_horaria']
                )
                instance.atividades_complementares.add(atividade_obj)


        if arquivos is not None:
            caminhos = []
            for arquivo in arquivos:
                path = default_storage.save(f'uploads/{arquivo.name}', ContentFile(arquivo.read()))
                caminhos.append(path)

            instance.anexos = caminhos

        instance.save() # Salva as alterações feitas nos ManyToMany e possibly MultiFileField
        return instance
from rest_framework import serializers
from ..models import FormTrancDisciplina, Curso, Disciplina, Ppc, Nome

class FormTrancDisciplinaSerializer(serializers.ModelSerializer):
    nome = serializers.SlugRelatedField(
        queryset=Nome.objects.all(),
        slug_field='nome'
    )
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    disciplinas = serializers.PrimaryKeyRelatedField(queryset=Disciplina.objects.all(), many=True)
    ingressante = serializers.BooleanField(default=False)

    # descricao agora é somente leitura (não virá do front)
    descricao = serializers.CharField(read_only=True)

    motivo_solicitacao = serializers.CharField(max_length=255, required=True)

    class Meta:
        model = FormTrancDisciplina
        fields = ['nome', 'curso', 'disciplinas', 'ingressante', 'descricao', 'motivo_solicitacao']

    def create(self, validated_data):
        # Texto fixo que você solicitou para a descrição
        descricao_texto = (
            "Este formulário destina-se à solicitação de trancamento de um ou mais componente(s) curricular(es) do período letivo vigente."
        )

        # Inserindo o texto fixo no campo descricao
        validated_data['descricao'] = descricao_texto
        return super().create(validated_data)

    def save(self, **kwargs):
        formTrancamento = super().save(**kwargs)
        formTrancamento.full_clean()
        formTrancamento.save()
        return formTrancamento
    
    def to_representation(self, instance):
        # Usando o método super para pegar a representação padrão
        representation = super().to_representation(instance)

        # Recuperando os PPCs associados ao curso do formulário
        ppcs = Ppc.objects.filter(curso=instance.curso)

        # Obtendo as disciplinas disponíveis para o curso
        disciplinas_disponiveis = Disciplina.objects.filter(ppc__in=ppcs).distinct()

        # Incluindo as disciplinas disponíveis na resposta (retornando código e nome)
        

        # Obtendo as disciplinas que foram selecionadas no formulário
        disciplinas_selecionadas = instance.disciplinas.all()

        # Retornando a representação com as disciplinas disponíveis
        return representation

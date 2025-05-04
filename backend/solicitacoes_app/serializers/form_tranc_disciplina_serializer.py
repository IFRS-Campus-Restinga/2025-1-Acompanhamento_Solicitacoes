from rest_framework import serializers
from ..models import FormTrancDisciplina, Curso, Disciplina, Ppc

class FormTrancDisciplinaSerializer(serializers.ModelSerializer):
    aluno = serializers.CharField(max_length=100)
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    disciplinas = serializers.PrimaryKeyRelatedField(queryset=Disciplina.objects.all(), many=True)
    ingressante = serializers.BooleanField(default=False)

    # descricao agora é somente leitura (não virá do front)
    descricao = serializers.CharField(read_only=True)

    motivo_solicitacao = serializers.CharField(max_length=255, required=True)

    class Meta:
        model = FormTrancDisciplina
        fields = ['aluno', 'curso', 'disciplinas', 'ingressante', 'descricao', 'motivo_solicitacao']

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
        representation = super().to_representation(instance)

        # Adiciona campo extra com as disciplinas disponíveis para seleção
        ppcs = Ppc.objects.filter(curso=instance.curso)
        disciplinas_disponiveis = Disciplina.objects.filter(ppcs__in=ppcs).distinct()
        # Apenas para apoio visual — mostra quais foram trancadas
        disciplinas_selecionadas = instance.disciplinas.all()

        return representation
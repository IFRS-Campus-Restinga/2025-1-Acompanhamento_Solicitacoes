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

    def validate(self, data):
        if not data.get('aluno'):
            raise serializers.ValidationError({"aluno": "O nome do aluno não pode estar vazio."})

        disciplinas = data.get('disciplinas', [])
        max_disciplinas = 2 if data.get('ingressante', False) else 5

        if len(disciplinas) < 1:
            raise serializers.ValidationError({"disciplinas": "Pelo menos uma disciplina deve ser selecionada para trancamento."})

        if len(disciplinas) > max_disciplinas:
            raise serializers.ValidationError({
                "disciplinas": f"O aluno não pode solicitar o trancamento de mais de {max_disciplinas} disciplinas."
            })

        return data

    def create(self, validated_data):
        # Texto fixo que você solicitou para a descrição
        descricao_texto = (
            "Este formulário destina-se à solicitação de trancamento de um ou mais componente(s) curricular(es) do período letivo vigente.\n\n"
            "Conforme art. 122 da Organização Didática, entende-se por trancamento de componente curricular o ato formal pelo qual o estudante solicita a desistência de um ou mais componentes curriculares do curso.\n\n"
            "Ainda, quando o estudante for ingressante será permitido o trancamento de até 2 (dois) componentes curriculares matriculados (art. 8º da Organização Didática).\n\n"
            "QUEM: Estudantes dos cursos subsequentes e do superior.\n\n"
            "QUANDO: A solicitação de trancamento de componente curricular poderá ser feita dentro de cada período letivo, conforme prazo estabelecido em nosso calendário acadêmico.\n\n"
            "Após entrega do formulário, a coordenação de curso fará a análise da solicitação em até 7 (sete) dias e a CRE tem até 5 (cinco) dias úteis para inserir os resultados no sistema. "
            "Este prazo pode ser estendido conforme as demandas da coordenação de curso e/ou do setor. O resultado pode ser conferido no sistema acadêmico."
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
        # Filtra as disciplinas para exibir apenas as que pertencem ao curso selecionado
        representation = super().to_representation(instance)
        curso = instance.curso

        # Obtém os PPCs associados ao curso
        ppcs = Ppc.objects.filter(curso=curso)

        # Obtém as disciplinas associadas a esses PPCs
        disciplinas_disponiveis = Disciplina.objects.filter(ppcs__in=ppcs)

        # Atualiza as opções de disciplinas no serializer
        representation['disciplinas'] = [
            disciplina.codigo for disciplina in disciplinas_disponiveis
        ]
        return representation
from rest_framework import serializers
from ..models import FormTrancDisciplina, Curso, Disciplina

class FormTrancDisciplinaSerializer(serializers.ModelSerializer):
    # Serializa o campo 'aluno' como um CharField
    aluno = serializers.CharField(max_length=100)
    
    # Serializa o campo 'curso' com uma chave estrangeira
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    
    # Serializa o campo 'disciplinas' com uma Many-to-Many relation
    disciplinas = serializers.PrimaryKeyRelatedField(queryset=Disciplina.objects.all(), many=True)
    
    # Serializa o campo booleano 'ingressante'
    ingressante = serializers.BooleanField(default=False)

    # Serializa o campo 'descricao' como TextField
    descricao = serializers.CharField(style={'base_template': 'textarea.html'}, required=True)
    
    # Serializa o campo 'motivo_solicitacao' como CharField
    motivo_solicitacao = serializers.CharField(max_length=255, required=True)
    
    class Meta:
        model = FormTrancDisciplina
        fields = ['aluno', 'curso', 'disciplinas', 'ingressante', 'descricao', 'motivo_solicitacao']
    
    def validate(self, data):
        # Validação para garantir que o nome do aluno não está vazio
        if not data.get('aluno'):
            raise serializers.ValidationError({"aluno": "O nome do aluno não pode estar vazio."})
        
        # Validação para a quantidade de disciplinas:
        # Se o aluno for ingressante, ele pode solicitar o trancamento de até 2 disciplinas
        # Se o aluno não for ingressante, ele pode solicitar o trancamento de até 5 disciplinas
        disciplinas = data.get('disciplinas', [])
        max_disciplinas = 2 if data.get('ingressante', False) else 5
        
        if len(disciplinas) < 1:
            raise serializers.ValidationError({"disciplinas": "Pelo menos uma disciplina deve ser selecionada para trancamento."})
        
        if len(disciplinas) > max_disciplinas:
            raise serializers.ValidationError({
                "disciplinas": f"O aluno não pode solicitar o trancamento de mais de {max_disciplinas} disciplinas."
            })
        
        return data

    def save(self, **kwargs):
        # Salva o formulário de solicitação de trancamento de disciplinas
        formTrancamento = super().save(**kwargs)
        
        # Se necessário, você pode incluir lógica adicional aqui para salvar ou associar outros dados
        formTrancamento.full_clean()
        formTrancamento.save()
        return formTrancamento
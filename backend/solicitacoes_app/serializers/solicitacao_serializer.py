from rest_framework import serializers
from ..models import Solicitacao
from django.utils import timezone

class SolicitacaoSerializer(serializers.ModelSerializer):
    tipo = serializers.SerializerMethodField()
    nome_aluno = serializers.SerializerMethodField()
    disponivel = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Solicitacao
        fields = '__all__'

    def get_tipo(self, obj):
        return obj.nome_formulario or obj.__class__.__name__

    def get_nome_aluno(self, obj):
        if obj.aluno and hasattr(obj.aluno, "usuario"):
            return obj.aluno.usuario.nome
        return "Aluno não disponível"
    
    def get_disponivel(self, obj):
        """Usa o método do model que você já testou"""
        return obj.verificar_disponibilidade()  # Chama a função testada no shell

    def validate(self, data):
        print("Validando dados:", data)  # Adicione esta linha
        data = super().validate(data)
        
        if 'nome_formulario' in data:
            print("Nome do formulário recebido:", data['nome_formulario'])  # Adicione esta linha
            from ..models import Disponibilidade
            from django.utils import timezone
            
            try:
                disp = Disponibilidade.objects.get(
                    formulario=data['nome_formulario'],
                    ativo=True
                )
                hoje = timezone.now().date()
                print("Data atual vs prazo:", hoje, ">", disp.data_fim)  # Adicione esta linha
                
                if not disp.sempre_disponivel and (hoje < disp.data_inicio or hoje > disp.data_fim):
                    raise serializers.ValidationError({
                        "nome_formulario": f"Período encerrado em {disp.data_fim}"
                    })
                    
            except Disponibilidade.DoesNotExist:
                print("Nenhuma regra de disponibilidade encontrada")  # Adicione esta linha
                pass
                
        return data
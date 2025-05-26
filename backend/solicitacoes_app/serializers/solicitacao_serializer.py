from rest_framework import serializers
from ..models import Solicitacao
from django.utils import timezone

class SolicitacaoSerializer(serializers.ModelSerializer):
    tipo = serializers.SerializerMethodField()
    nome_aluno = serializers.SerializerMethodField()
    disponivel = serializers.SerializerMethodField(read_only=True)
    mensagem_disponibilidade = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Solicitacao
        fields = '__all__'
        extra_kwargs = {
            'data_solicitacao': {'required': True},
            'nome_formulario': {'required': True}
        }

    def get_tipo(self, obj):
        return obj.nome_formulario or obj.__class__.__name__

    def get_nome_aluno(self, obj):
        if obj.aluno and hasattr(obj.aluno, "usuario"):
            return obj.aluno.usuario.nome
        return "Aluno não disponível"
    
    def get_disponivel(self, obj):
        return obj.verificar_disponibilidade()
    
    def get_mensagem_disponibilidade(self, obj):
        from ..models import Disponibilidade
        try:
            disp = Disponibilidade.objects.get(formulario=obj.nome_formulario)
            if disp.sempre_disponivel:
                return "Formulário sempre disponível"
            hoje = timezone.now().date()
            if hoje < disp.data_inicio:
                return f"Disponível a partir de {disp.data_inicio}"
            elif hoje > disp.data_fim:
                return f"Período encerrado em {disp.data_fim}"
            return f"Disponível até {disp.data_fim}"
        except Disponibilidade.DoesNotExist:
            return "Formulário disponível"

    def validate(self, data):
        data = super().validate(data)
        
        if 'nome_formulario' in data:
            from ..models import Disponibilidade
            hoje = timezone.now().date()
            
            try:
                disp = Disponibilidade.objects.get(
                    formulario=data['nome_formulario'],
                    ativo=True
                )
                
                if not disp.sempre_disponivel:
                    if hoje < disp.data_inicio:
                        raise serializers.ValidationError({
                            "nome_formulario": f"Disponível a partir de {disp.data_inicio}"
                        })
                    if hoje > disp.data_fim:
                        raise serializers.ValidationError({
                            "nome_formulario": f"Período encerrado em {disp.data_fim}"
                        })
                        
            except Disponibilidade.DoesNotExist:
                pass
                
        return data
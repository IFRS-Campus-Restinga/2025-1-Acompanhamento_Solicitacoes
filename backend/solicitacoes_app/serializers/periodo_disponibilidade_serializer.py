from rest_framework import serializers
from django.db.models import Q # Importe Q para construir consultas complexas
from django.utils import timezone
from ..models import PeriodoDisponibilidade

class PeriodoDisponibilidadeSerializer(serializers.ModelSerializer):
    esta_ativo = serializers.SerializerMethodField()
    formulario_nome = serializers.CharField(
        source='disponibilidade.get_formulario_display', 
        read_only=True
    )

    class Meta:
        model = PeriodoDisponibilidade
        fields = [
            'id',
            'disponibilidade',
            'formulario_nome',
            'data_inicio',
            'data_fim',
            'esta_ativo'
        ]
        extra_kwargs = {
            'disponibilidade': {'required': True},
            'data_inicio': {'required': True},
        }

    def validate(self, data):
        data_inicio_novo = data.get('data_inicio')
        data_fim_novo = data.get('data_fim') # Pode ser None

        # Validação básica: data_fim não pode ser anterior à data de início
        if data_fim_novo and data_fim_novo < data_inicio_novo:
            raise serializers.ValidationError({
                'data_fim': 'A data final não pode ser anterior à data de início.'
            })

        disponibilidade = data.get('disponibilidade', self.instance.disponibilidade if self.instance else None)
        
        if not disponibilidade:
            raise serializers.ValidationError("Disponibilidade é um campo obrigatório.")

        # Consulta por períodos existentes para a mesma 'disponibilidade'
        qs = PeriodoDisponibilidade.objects.filter(disponibilidade=disponibilidade)
        
        # Se estiver atualizando uma instância existente, exclua-a da verificação de sobreposição
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        # --- Lógica de verificação de sobreposição (robustez para data_fim = None) ---

        # Caso 1: O NOVO período não tem data de término (indefinido)
        if data_fim_novo is None:
            # Overlaps se algum período existente:
            # a) Também é indefinido (data_fim__isnull=True)
            # OU
            # b) Tem uma data de término definida que é DEPOIS da data de início do novo período (indefinido)
            overlap_conditions = (
                Q(data_fim__isnull=True) |  # Sobrepõe com outro período indefinido
                Q(data_fim__gt=data_inicio_novo) # Sobrepõe com um período definido que termina depois do início deste
            )
        # Caso 2: O NOVO período tem uma data de término definida
        else:
            # Overlaps se algum período existente:
            # a) É indefinido E sua data de início é ANTES da data de término do novo período (definido)
            # OU
            # b) É definido E seus intervalos se cruzam (verificação de sobreposição padrão)
            overlap_conditions = (
                Q(data_fim__isnull=True, data_inicio__lt=data_fim_novo) | # Existente indefinido que começa antes do fim do novo
                Q(data_inicio__lt=data_fim_novo, data_fim__gt=data_inicio_novo) # Existente definido que se cruza
            )
        
        if qs.filter(overlap_conditions).exists():
            raise serializers.ValidationError({
                'non_field_errors': 'Este período se sobrepõe a um período existente para o mesmo formulário.'
            })

        return data

    def get_esta_ativo(self, obj):
        return obj.esta_ativo # Este método deve vir do modelo PeriodoDisponibilidade se 'esta_ativo' não for um campo de modelo

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Garante que data_inicio e data_fim (se existirem) sejam strings ISO formatadas
        representation['data_inicio'] = instance.data_inicio.isoformat()
        if instance.data_fim:
            representation['data_fim'] = instance.data_fim.isoformat()
        # Se 'esta_ativo' é um SerializerMethodField, a representação já será pega.
        # Se ele não existe no modelo PeriodoDisponibilidade e depende de algo, ele precisa ser calculado aqui.
        # Caso contrário, remova esta linha se 'esta_ativo' já vem do modelo ou do get_esta_ativo.
        # Se 'esta_ativo' vier do modelo 'Disponibilidade' pai, o serializer precisa ter um campo para isso,
        # ou ser obtido via o ManyToManyField reverso no DisponibilidadeSerializer.
        return representation
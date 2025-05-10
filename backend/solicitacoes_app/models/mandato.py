from django.db import models
from .base import BaseModel
from .curso import Curso
from .coordenador import Coordenador
from django.core.exceptions import ValidationError

class Mandato(BaseModel):
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name="mandatos_curso"
    )
    coordenador = models.ForeignKey(
        Coordenador,
        on_delete=models.CASCADE,
        related_name="mandatos_coordenador"
    )
    inicio_mandato = models.DateField()
    fim_mandato = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Mandato de {self.coordenador} no curso {self.curso}. Início: {self.inicio_mandato} / Fim: {self.fim_mandato} "

    def clean(self):
        """Garante que o fim do mandato seja posterior ao início e que não haja sobreposição de mandatos para o mesmo curso."""
        
        # Valida se o fim do mandato é posterior ao início
        if self.fim_mandato and self.inicio_mandato >= self.fim_mandato:
            raise ValidationError("O fim do mandato deve ser posterior ao início.")
        
           # Valida sobreposição com qualquer dia de mandato ativo
        mandatos_existentes = Mandato.objects.filter(
            curso=self.curso,
            coordenador=self.coordenador
        ).exclude(pk=self.pk)

        for mandato in mandatos_existentes:
            novo_inicio = self.inicio_mandato
            novo_fim = self.fim_mandato
            existente_inicio = mandato.inicio_mandato
            existente_fim = mandato.fim_mandato

            # Verifica se há alguma sobreposição entre os períodos
            if novo_inicio <= (existente_fim or novo_inicio) and (novo_fim or existente_inicio) >= existente_inicio:
                raise ValidationError(
                    f"O período deste mandato se sobrepõe ao mandato existente de {existente_inicio} a {existente_fim or 'indefinido'}."
                )
            
    class Meta:
        verbose_name = "Mandato"
        verbose_name_plural = "Mandatos"
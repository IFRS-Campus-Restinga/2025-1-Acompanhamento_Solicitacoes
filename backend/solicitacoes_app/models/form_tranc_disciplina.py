from django.db import models
from .disciplina import Disciplina
from .solicitacao import Solicitacao
from django.core.exceptions import ValidationError

class FormTrancDisciplina(Solicitacao):
    # NOVO: Esta linha é essencial para a integração com o modelo pai.
    NOME_FORMULARIO_IDENTIFICADOR = 'TRANCAMENTODISCIPLINA'
    
    disciplinas = models.ManyToManyField(Disciplina, related_name="formularios_trancamento", help_text="Selecione as disciplinas que deseja trancar")
    ingressante = models.BooleanField(default=False, help_text="Marque se o aluno é ingressante. Essa informação é importante para limitar a quantidade de trancamentos.")
    motivo_solicitacao = models.TextField()
    
    def save(self, *args, **kwargs):
        # REMOVIDO: Linhas que definem `nome_formulario` e `data_solicitacao`
        # pois agora são tratadas pelo modelo pai.
        super().save(*args, **kwargs)
        
    class Meta:
        verbose_name = "Formulário de Trancamento de Componente Curricular"
        verbose_name_plural = "Formulários de Trancamento de Componente Curricular"
    
    def clean(self):
        # ... (seu método clean permanece o mesmo)
        super().clean()
        if self.pk: # Garante que as disciplinas já estão salvas para poder contar
            qtd_disciplinas = self.disciplinas.count()
            limite = 2 if self.ingressante else 5
            if qtd_disciplinas > limite:
                raise ValidationError({'disciplinas': f'Alunos {"ingressantes" if self.ingressante else "regulares"} podem trancar no máximo {limite} disciplinas.'})
            if qtd_disciplinas < 1:
                raise ValidationError({'disciplinas': 'Pelo menos uma disciplina deve ser selecionada para trancamento.'})

    def __str__(self):
        # ALTERADO: Usa o `verbose_name` do modelo, pois `nome_formulario` não existe mais.
        return f"{self._meta.verbose_name} (ID: {self.id})"
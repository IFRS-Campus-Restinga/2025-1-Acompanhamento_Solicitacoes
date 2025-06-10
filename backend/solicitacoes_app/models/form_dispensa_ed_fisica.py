
from django.db import models
from django.conf import settings
import os
import mimetypes

from ..utils.google_drive import upload_to_drive
from ..models.motivo_dispensa import MotivoDispensa
from .solicitacao import Solicitacao
from .multi_file_field import MultiFileField

class FormDispensaEdFisica(Solicitacao):
    # NOVO: Esta linha é essencial para a integração com o modelo pai.
    NOME_FORMULARIO_IDENTIFICADOR = 'DISPENSAEDFISICA'
    
    turma = models.CharField(
        max_length=10, 
        verbose_name="Turma",
        help_text="Digite sua turma"
    )
    ano_semestre_ingresso = models.CharField(
        max_length=7,
        verbose_name="Ano/Semestre de Ingresso",
        help_text="Digite o ano/semestre de ingresso"
    )
    motivo_solicitacao = models.ForeignKey(
        MotivoDispensa, 
        on_delete=models.RESTRICT, 
        help_text="Escolha seu motivo da solicitação", 
        verbose_name="Motivo da Solicitação"
    )
    observacoes = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name="Observações",
        help_text="Digite suas observações"
    )
    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")

    def save(self, *args, **kwargs):
        # REMOVIDO: A linha abaixo foi removida pois o campo `nome_formulario` não existe mais no modelo pai.
        # self.nome_formulario = "Dispensa de Educação Física"
        
        # REMOVIDO: A linha abaixo foi removida pois a data já é definida pelo `default` no modelo pai.
        # if not self.data_solicitacao:
        #     self.data_solicitacao = date.isoformat()
        
        # MANTIDO: Sua lógica de negócio para o upload de arquivos permanece intacta.
        """Método para salvar anexos no Google Drive"""
        
        if self.anexos:
            for path in self.anexos:
                local_path = os.path.join(settings.MEDIA_ROOT, path)
                if os.path.exists(local_path):
                    with open(local_path, 'rb') as f:
                        print(local_path)
                        mime_type = mimetypes.guess_type(local_path)[0] or 'application/octet-stream'
                        upload_to_drive(f, os.path.basename(local_path), mime_type)
                else:
                    raise FileNotFoundError
        
        # MANTIDO: A chamada ao save() do pai é crucial e permanece no final.
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Formulário de Dispensa de Educação Física"
    
    def __str__(self):
        # ALTERADO: Um __str__ mais descritivo para consistência.
        aluno_nome = self.aluno.usuario.nome if self.aluno and self.aluno.usuario else "Aluno não identificado"
        return f"Dispensa de Ed. Física - {aluno_nome}"
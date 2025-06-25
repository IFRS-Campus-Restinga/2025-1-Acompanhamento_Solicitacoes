from datetime import date
import mimetypes
import os

from django.conf import settings

from ...utils.google_drive import upload_to_drive
from ...models.motivo_dispensa import MotivoDispensa
from ..solicitacao import Solicitacao
from ..curso import Curso
from django.db.models import ForeignKey, CharField, RESTRICT
from ..aluno import Aluno
from ..multi_file_field import MultiFileField

class FormDispensaEdFisica(Solicitacao):
    
    # turma = CharField(max_length=10, 
    #                   verbose_name="Turma",
    #                   help_text="Digite sua turma")
    
    # ano_semestre_ingresso = CharField(
    #     max_length=7,
    #     verbose_name="Ano/Semestre de Ingresso",
    #     help_text="Digite o ano/semestre de ingresso"
    # )


    motivo_solicitacao = ForeignKey(MotivoDispensa, 
                                       on_delete=RESTRICT, 
                                       help_text="Escolha seu motivo da solicitação", 
                                       verbose_name="Motivo da Solicitação")
    
    # observacoes = CharField(
    #     max_length=300,
    #     blank=True,
    #     null=True,
    #     verbose_name="Observações",
    #     help_text="Digite suas observações"
    # )

    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")

    def save(self, *args, **kwargs):
        self.nome_formulario = "Dispensa de Educação Física"
        if not self.data_solicitacao:  # 👈 Se não tiver data, define como agora
            self.data_solicitacao = date.isoformat()
        
        """Método para salvar anexos no Google Drive"""
        for path in self.anexos:
            local_path = os.path.join(settings.MEDIA_ROOT, path)
            if os.path.exists(local_path):
                with open(local_path, 'rb') as f:
                    print(local_path)
                    mime_type = mimetypes.guess_type(local_path)[0] or 'application/octet-stream'
                    upload_to_drive(f, os.path.basename(local_path), mime_type)
            else:
                raise FileNotFoundError
    
        super().save(*args, **kwargs)

    
    class Meta:
        verbose_name = "Formulário de Dispensa de Educação Física"
    
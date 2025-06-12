from datetime import timezone
import mimetypes
import os
from django.conf import settings

from ..utils.google_drive import upload_to_drive
from .solicitacao import Solicitacao
from django.db import models
from .aluno import Aluno
from .curso import Curso
from .disciplina import Disciplina
from .multi_file_field import MultiFileField
from datetime import date

class FormEntregaAtivCompl(Solicitacao):
    disciplinas = models.ManyToManyField(Disciplina,
        verbose_name="Disciplinas",
        help_text="Selecione as disciplinas"
    )
    
    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")

    def save(self, *args, **kwargs):
        self.nome_formulario = "Entrega de Atividades Complementares"
        if not self.data_solicitacao:  # 👈 Se não tiver data, define como agora
            self.data_solicitacao = date.isoformat()
        

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
        verbose_name = "Formulário de Atividades Complementares"
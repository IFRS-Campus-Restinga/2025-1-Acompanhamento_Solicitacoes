# seu_app/models/form_entrega_ativ_compl.py
from django.db import models
from django.conf import settings
import os
import mimetypes

from ..utils.google_drive import upload_to_drive
from .solicitacao import Solicitacao
from .disciplina import Disciplina
from .multi_file_field import MultiFileField

class FormEntregaAtivCompl(Solicitacao):
    # NOVO: Esta linha é essencial para a integração com o modelo pai.
    # OBS: O seu modelo `Disponibilidade` usa a chave 'ENTREGACERTIFICADOS'. 
    # Verifique se esta é a chave correta para este formulário.
    NOME_FORMULARIO_IDENTIFICADOR = 'ENTREGACERTIFICADOS'
    
    disciplinas = models.ManyToManyField(Disciplina, verbose_name="Disciplinas", help_text="Selecione as disciplinas")
    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")

    def save(self, *args, **kwargs):
        # REMOVIDO: Linhas que definem `nome_formulario` e `data_solicitacao`
        # pois agora são tratadas pelo modelo pai.

        # MANTIDO: Sua lógica de upload.
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
        
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Formulário de Atividades Complementares"
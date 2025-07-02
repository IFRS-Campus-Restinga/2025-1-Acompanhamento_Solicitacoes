import mimetypes
import os
from django.conf import settings

from ...utils.google_drive import upload_to_drive
from ..solicitacao import Solicitacao
from .form_exercicio_domiciliar import FormExercicioDomiciliar
from ..multi_file_field import MultiFileField
from django.db import models
from datetime import date

class HistoricoAfastamento(Solicitacao):
    form_exercicio_domiciliar = models.ForeignKey(FormExercicioDomiciliar,
                                                  on_delete=models.RESTRICT)
    
    nova_data_fim_afastamento = models.DateField(
        default=date.today,
        verbose_name="Nova Data de Fim do Afastamento"
    )

    justificativa = models.CharField(verbose_name="Justificativa/Observações",
                                     max_length=500)

    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos", null=True, blank=True)

    def save(self, *args, **kwargs):
        self.nome_formulario = "Extensão do prazo de afastamento"
        if not self.data_solicitacao:  # 👈 Se não tiver data, define como agora
            self.data_solicitacao = date.isoformat()
        
        """Método para salvar anexos no Google Drive"""
        if self.anexos is None:
            pass
        else:
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

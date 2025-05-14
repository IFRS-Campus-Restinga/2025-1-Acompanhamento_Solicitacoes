from ..models.motivo_dispensa import MotivoDispensa
from .form_base import FormularioBase
from .curso import Curso
from django.db.models import ForeignKey, CharField, RESTRICT
from .aluno import Aluno
from .multi_file_field import MultiFileField

class FormDispensaEdFisica(FormularioBase):
    aluno = ForeignKey(Aluno,
                       on_delete=RESTRICT,
                       verbose_name="Aluno",
                       help_text="Selecione o aluno")
    
    turma = CharField(max_length=10, 
                      verbose_name="Turma",
                      help_text="Digite sua turma")
    
    ano_semestre_ingresso = CharField(
        max_length=7,
        verbose_name="Ano/Semestre de Ingresso",
        help_text="Digite o ano/semestre de ingresso"
    )


    motivo_solicitacao = ForeignKey(MotivoDispensa, 
                                       on_delete=RESTRICT, 
                                       help_text="Escolha seu motivo da solicitação", 
                                       verbose_name="Motivo da Solicitação")
    
    observacoes = CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name="Observações",
        help_text="Digite suas observações"
    )

    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")

    
    class Meta:
        verbose_name = "Formulário de Dispensa de Educação Física"
    
    def __str__(self):
        return str(self.id)
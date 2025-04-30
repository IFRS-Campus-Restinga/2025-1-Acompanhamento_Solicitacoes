from ..models.motivo_dispensa import MotivoDispensa
from .form_base import FormularioBase
from .curso import Curso
from django.db.models import ForeignKey, RESTRICT, CASCADE

class FormDispensaEdFisica(FormularioBase):
    curso = ForeignKey(
        Curso,
        on_delete=CASCADE,
        verbose_name="Curso", 
        help_text="Selecione o curso"
    )

    motivo_solicitacao = ForeignKey(MotivoDispensa, 
                                       on_delete=RESTRICT, 
                                       help_text="Escolha seu motivo da solicitação", 
                                       verbose_name="Motivo da Solicitação")
    
    class Meta:
        verbose_name = "Formulário de Dispensa de Educação Física"
    
    def __str__(self):
        return str(self.id)
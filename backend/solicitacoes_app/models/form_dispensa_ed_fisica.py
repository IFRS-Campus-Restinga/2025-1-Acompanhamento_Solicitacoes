from ..models.motivo_dispensa import MotivoDispensa
from .form_base import FormularioBase
from django.db.models import OneToOneField, RESTRICT

class FormDispensaEdFisica(FormularioBase):
    motivo_solicitacao = OneToOneField(MotivoDispensa, 
                                       on_delete=RESTRICT, 
                                       help_text="Escolha seu motivo da solicitação", 
                                       verbose_name="Motivo da Solicitação")
    
    class Meta:
        verbose_name = "Formulário de Dispensa de Educação Física"
    
    def __str__(self):
        return self.nome
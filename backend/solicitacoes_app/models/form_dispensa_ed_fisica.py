from ..models.motivo_dispensa import MotivoDispensa
from .form_base import FormularioBase
from .curso import Curso
from django.db.models import ForeignKey, CharField, EmailField, RESTRICT
from .aluno import Aluno
from .validators import validar_cpf

class FormDispensaEdFisica(FormularioBase):
    aluno = ForeignKey(Aluno,
                       on_delete=RESTRICT,
                       verbose_name="Aluno",
                       help_text="Selecione o aluno")
    
    email = EmailField(verbose_name="Email",
                       help_text="Email será autopreenchido")
    
    cpf = CharField(max_length=11,
                    verbose_name="CPF",
                    help_text="CPF será autopreenchido",
                    validators=[validar_cpf])
    
    matricula = CharField(max_length=20,
                          verbose_name="Matrícula",
                          help_text="Matrícula será autopreenchido")


    curso = ForeignKey(
        Curso,
        on_delete=RESTRICT,
        verbose_name="Curso", 
        help_text="Selecione o curso"
    )
    
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

    
    class Meta:
        verbose_name = "Formulário de Dispensa de Educação Física"
    
    def __str__(self):
        return str(self.id)
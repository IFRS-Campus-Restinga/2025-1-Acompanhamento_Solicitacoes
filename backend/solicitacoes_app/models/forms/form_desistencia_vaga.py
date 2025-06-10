# seu_app/models/forms/form_desistencia_vaga.py

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, RegexValidator

# ALTERADO: Todas as importações que buscam modelos no diretório pai `models`
# agora usam `..` para subir um nível.
from ..curso import Curso
from ..solicitacao import Solicitacao

class FormDesistenciaVaga(Solicitacao):
    NOME_FORMULARIO_IDENTIFICADOR = 'DESISTENCIAVAGA'

    class Meta:
        verbose_name = "Formulário de Desistência de Vaga"
    
    TIPO_CURSO_CHOICES = [
        ("medio_integrado", "Ensino Médio Integrado"),
        ("subsequente", "Curso Subsequente"),
        ("eja", "Curso EJA"),
        ("superior", "Curso Superior"),
    ]

    MOTIVO_DESISTENCIA_CHOICES = [
        ("transferencia", "Transferência para outra escola"),
        ("desistencia", "Desistência da vaga"),
    ]

    aluno_nome = models.CharField(max_length=100)
    email = models.EmailField(validators=[EmailValidator()])
    
    cpf = models.CharField(
        max_length=14, 
        validators=[
            RegexValidator(
                regex=r'^\d{3}\.\d{3}\.\d{3}\-\d{2}$', 
                message="O CPF deve estar no formato XXX.XXX.XXX-XX"
            )
        ],
        verbose_name="CPF do aluno"
    )

    curso = models.ForeignKey(
        Curso, 
        on_delete=models.CASCADE, 
        related_name="formularios_desistencia_vaga", 
        blank=True, 
        null=True
    )

    tipo_curso = models.CharField(max_length=20, choices=TIPO_CURSO_CHOICES)
    
    motivo_desistencia = models.CharField(
        max_length=20, 
        choices=MOTIVO_DESISTENCIA_CHOICES, 
        verbose_name="Motivo da Desistência"
    )

    motivo_solicitacao = models.TextField()
    
    ano_semestre_ingresso = models.CharField(
        max_length=7, 
        verbose_name="Ano/Semestre de Ingresso", 
        help_text="Formato: AAAA/S (ex.: 2024/1)"
    )

    menor_idade = models.BooleanField(
        default=False, 
        verbose_name="É menor de idade?"
    )

    recebe_auxilio_estudantil = models.BooleanField(
        default=False,
        verbose_name="Recebe auxílio estudantil?"
    )

    atestado_vaga_nova_escola = models.FileField(
        upload_to='desistencia/', 
        blank=True, 
        null=True, 
        verbose_name="Atestado de vaga da nova escola", 
        help_text="Somente necessário se Ensino Médio"
    )
    
    doc_identificacao_responsavel = models.FileField(
        upload_to='desistencia/', 
        blank=True, 
        null=True, 
        verbose_name="Documento de identificação do responsável legal", 
        help_text="Somente necessário se Ensino Médio"
    )
    
    declaracao_biblioteca = models.FileField(
        upload_to='desistencia/', 
        verbose_name="Declaração de Nada Consta da Biblioteca"
    )

    def clean(self):
        super().clean()
        if self.tipo_curso == "medio_integrado":
            if not self.atestado_vaga_nova_escola:
                raise ValidationError({
                    "atestado_vaga_nova_escola": "Obrigatório para Ensino Médio Integrado."
                })
            if not self.doc_identificacao_responsavel:
                raise ValidationError({
                    "doc_identificacao_responsavel": "Obrigatório para Ensino Médio Integrado."
                })

    def __str__(self):
        return f"Desistência de Vaga - {self.aluno_nome}"
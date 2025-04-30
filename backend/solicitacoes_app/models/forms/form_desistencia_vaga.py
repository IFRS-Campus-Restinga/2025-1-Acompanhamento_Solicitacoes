from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import *
from ..curso import Curso
from ..form_base import FormularioBase

class FormDesistenciaVaga(FormularioBase):

    class Meta:
        verbose_name = "Formulário de Desistência de Vaga"


    TIPO_CURSO_CHOICES = [
        ("medio_integrado", "Ensino Médio Integrado"),
        ("subsequente", "Curso Subsequente"),
        ("eja", "Curso EJA"),
        ("superior", "Curso Superior"),
    ]

    aluno_nome = models.CharField(max_length=100)
    email = models.EmailField(validators=[EmailValidator()])
    matricula = models.CharField(max_length=20)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name="formularios_desistencia_vaga", blank=True, null= True)
    tipo_curso = models.CharField(max_length=20, choices=TIPO_CURSO_CHOICES)

    # Documentos
    atestado_vaga_nova_escola = models.FileField(upload_to='desistencia/', blank=True, null=True, verbose_name="Atestado de vaga da nova escola", help_text="Somente necessário se Ensino Medio")
    doc_identificacao_responsavel = models.FileField(upload_to='desistencia/', blank=True, null=True, verbose_name="Documento de identificação do responsável legal", help_text="Somente necessário se Ensino Medio")
    declaracao_biblioteca = models.FileField(upload_to='desistencia/', verbose_name="Declaração de Nada Consta da Biblioteca")

    def clean(self):
        super().clean()

        if self.tipo_curso == "medio_integrado":
            if not self.atestado_vaga_nova_escola:
                raise ValidationError({"atestado_vaga_nova_escola": "Obrigatório para Ensino Médio Integrado."})
            if not self.doc_identificacao_responsavel:
                raise ValidationError({"doc_identificacao_responsavel": "Obrigatório para Ensino Médio Integrado."})

        # Para todos os tipos, a declaração da biblioteca já é obrigatória (campo não permite null/blank)

    def __str__(self):
        return f"Desistência de Vaga - {self.aluno_nome}"
    
    

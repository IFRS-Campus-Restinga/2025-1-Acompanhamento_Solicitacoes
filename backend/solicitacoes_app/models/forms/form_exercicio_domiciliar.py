from django.db import models
from ..curso import Curso
from ..form_base import FormularioBase
from django.core.validators import MinLengthValidator, EmailValidator

class FormExercicioDomiciliar(FormularioBase):
    
    class Meta:
        verbose_name = "Formulário de Exercícios Domiciliares"
        

    MOTIVOS_SOLICITACAO_CHOICES = [
        ("saude", "Problemas de saúde, conforme inciso I do art. 142 da OD."),
        ("maternidade", "Licença Maternidade, conforme inciso II do art. 142 da OD."),
        ("familiar", "Acompanhamento de familiar (primeiro grau) com problemas de saúde, inciso III, art. 142 da OD."),
        ("aborto_ou_falecimento", "Gestantes que sofreram aborto, falecimento do recém-nascido ou natimorto (IV, 142, OD)"),
        ("adocao", "Adoção de criança, conforme inciso V, art. 142 da OD."),
        ("conjuge", "Licença cônjuge/companheiro de parturiente/puerperas, conforme inciso VI do art. 142 da OD."),
        ("outro", "Outro")
    ]

    DOCUMENTO_APRESENTADO_CHOICES = [
        ("atestado", "Atestado médico"),
        ("certidao_nascimento", "Certidão de nascimento"),
        ("termo_guarda", "Termo judicial de guarda"),
        ("certidao_obito", "Certidão de óbito"),
        ("justificativa_propria", "Justificativa de próprio punho para falta da documentação"),
        ("outro", "Outro")
    ]

    aluno_nome = models.CharField(max_length=100, validators=[MinLengthValidator(1)])
    email = models.EmailField(validators=[EmailValidator()])
    matricula = models.CharField(max_length=20, validators=[MinLengthValidator(1)])
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name="formularios_exercicios_domiciliares")
    componentes_curriculares = models.TextField()

    motivo_solicitacao = models.CharField(max_length=30, choices=MOTIVOS_SOLICITACAO_CHOICES)
    outro_motivo = models.CharField(max_length=255, blank=True, null=True)

    periodo_afastamento = models.CharField(max_length=255, help_text="Descreva o período informado no atestado ou documento.")

    documento_apresentado = models.CharField(max_length=30, choices=DOCUMENTO_APRESENTADO_CHOICES)
    outro_documento = models.CharField(max_length=255, blank=True, null=True)

    arquivos = models.FileField(upload_to="documentos_exercicios_domiciliares/", blank=True, null=True)

    consegue_realizar_atividades = models.BooleanField()

    def __str__(self):
        return f"Exercício Domiciliar - {self.aluno_nome} ({self.curso.nome})"

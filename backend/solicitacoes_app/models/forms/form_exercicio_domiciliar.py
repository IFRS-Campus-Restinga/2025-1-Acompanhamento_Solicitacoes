# seu_app/models/forms/form_exercicio_domiciliar.py

from django.db import models
from datetime import date

# ALTERADO: A importação agora usa '..' para subir um nível de 'forms' para 'models'.
from ..periodo_disciplina import PeriodoDisciplina
from ..ppc import Ppc
from ..curso import Curso
from ..solicitacao import Solicitacao
from ..disciplina import Disciplina

class FormExercicioDomiciliar(Solicitacao):
    NOME_FORMULARIO_IDENTIFICADOR = 'EXERCICIOSDOMICILIARES'

    class Meta:
        verbose_name = "Formulário de Exercícios Domiciliares"
        verbose_name_plural = "Formulários de Exercícios Domiciliares"
        ordering = ['-data_solicitacao']

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

    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name="formularios_exercicios_domiciliares",
        verbose_name="Curso"
    )

    periodo = models.CharField(
        max_length=20,
        choices=PeriodoDisciplina.choices,
        default=PeriodoDisciplina.PRIMEIRO_SEMESTRE,
        verbose_name="Período",
        help_text="Período das disciplinas"
    )

    ppc = models.ForeignKey(
        Ppc,
        on_delete=models.CASCADE,
        related_name='exercicios_domiciliares',
        null=True
    )

    disciplinas = models.ManyToManyField(
        Disciplina,
        verbose_name="Disciplinas relacionadas"
    )

    motivo_solicitacao = models.CharField(
        max_length=30,
        choices=MOTIVOS_SOLICITACAO_CHOICES,
        verbose_name="Motivo da Solicitação"
    )
    
    outro_motivo = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Outro Motivo"
    )
    
    data_inicio_afastamento = models.DateField(
        default=date.today,
        verbose_name="Data de Início do Afastamento"
    )
    
    data_fim_afastamento = models.DateField(
        default=date.today,
        verbose_name="Data de Fim do Afastamento"
    )

    documento_apresentado = models.CharField(
        max_length=30,
        choices=DOCUMENTO_APRESENTADO_CHOICES,
        verbose_name="Documento Apresentado"
    )
    
    outro_documento = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Outro Documento"
    )

    arquivos = models.FileField(
        upload_to="documentos_exercicios_domiciliares/%Y/%m/%d/",
        blank=True,
        null=True,
        verbose_name="Arquivos Anexados"
    )

    consegue_realizar_atividades = models.BooleanField(
        verbose_name="Consegue Realizar Atividades Remotas"
    )

    def __str__(self):
        aluno_nome = self.aluno.usuario.nome if self.aluno and self.aluno.usuario else "Aluno não identificado"
        return f"Exercício Domiciliar - {aluno_nome} ({self.curso.nome})"
    
    @property
    def periodo_afastamento(self):
        """Calcula o período de afastamento em dias"""
        if self.data_inicio_afastamento and self.data_fim_afastamento:
            return (self.data_fim_afastamento - self.data_inicio_afastamento).days + 1
        return 0
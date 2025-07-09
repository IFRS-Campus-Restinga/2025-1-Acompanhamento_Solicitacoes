from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, RegexValidator
from ..curso import Curso
from ..solicitacao import Solicitacao
from ...models import Aluno, Usuario 
from django.db.models import RESTRICT
from solicitacoes_app.models.campos_solic_models.motivo_desistencia import MotivoDesistencia

class FormDesistenciaVaga(Solicitacao):
    """
    Modelo para formulário de desistência de vaga.
    Pode ser preenchido por alunos ou usuários externos.
    """

    class Meta:
        verbose_name = "Formulário de Desistência de Vaga"
        verbose_name_plural = "Formulários de Desistência de Vaga"
    
    nome_formulario = "Formulário de Desistência de Vaga"
    
    # Campos para identificar o solicitante (Aluno ou Usuário/Externo)
    aluno = models.ForeignKey(
        Aluno, 
        on_delete=models.PROTECT, 
        related_name='desistencia_vagas_aluno',
        null=True, 
        blank=True, 
        help_text="Aluno que solicita a desistência (se aplicável)."
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='desistencia_vagas_usuario', 
        null=True, 
        blank=True, 
        help_text="Usuário logado que submeteu a solicitação (pode ser Aluno, Externo, Responsável)."
    )

    # Campos para dados pessoais (obrigatórios para todos)
    nome_completo = models.CharField(
        max_length=255, 
        help_text="Nome Completo do Solicitante"
    )
    email = models.EmailField(
        help_text="Email do Solicitante",
        validators=[EmailValidator()]
    )
    cpf = models.CharField(
        max_length=14, 
        validators=[
            RegexValidator(
                regex=r'^\d{3}\.\d{3}\.\d{3}\-\d{2}$', 
                message="O CPF deve estar no formato XXX.XXX.XXX-XX"
            )
        ],
        help_text="CPF do Solicitante",
    )

    # Campo do curso - agora usando ForeignKey para o modelo Curso
    curso = models.ForeignKey(
        Curso, 
        on_delete=models.PROTECT,  # Protege contra deleção acidental do curso
        related_name="formularios_desistencia_vaga", 
        verbose_name="Curso",
        help_text="Curso do qual deseja desistir"
    )

    # Motivo da desistência
    motivo_desistencia = models.ForeignKey(
        MotivoDesistencia,
        on_delete=RESTRICT, 
        help_text="Escolha seu motivo da solicitação", 
        verbose_name="Motivo da Desistência"
    )  

    # Descrição detalhada do motivo
    descricao_motivo = models.TextField(
        verbose_name="Descrição do Motivo",
        help_text="Descreva detalhadamente o motivo da sua desistência"
    ) 

    # Informações adicionais
    menor_idade = models.BooleanField(
        default=False, 
        verbose_name="É menor de idade?",
        help_text="Indica se o solicitante é menor de 18 anos"
    )

    recebe_auxilio_estudantil = models.BooleanField(
        default=False,
        verbose_name="Recebe auxílio estudantil?",
        help_text="Indica se o estudante recebe auxílio estudantil"
    )

    # Documentos obrigatórios
    declaracao_biblioteca = models.FileField(
        upload_to='desistencia/biblioteca/', 
        verbose_name="Certidão de Nada Consta da Biblioteca",
        help_text="Documento obrigatório para todos os solicitantes"
    )
    
    # Documentos condicionais
    atestado_vaga_nova_escola = models.FileField(
        upload_to='desistencia/atestado/', 
        blank=True, 
        null=True, 
        verbose_name="Atestado de vaga da nova escola", 
        help_text="Obrigatório apenas para transferências"
    )
    
    doc_identificacao_responsavel = models.FileField(
        upload_to='desistencia/responsavel/', 
        blank=True, 
        null=True, 
        verbose_name="Documento de identificação do responsável legal", 
        help_text="Obrigatório apenas para menores de idade"
    )

    # Campo para a declaração final obrigatória
    declaracao_final_acordo = models.BooleanField(
        default=False,
        verbose_name="Aceita a declaração final",
        help_text="Declaro que as informações prestadas são verdadeiras e autênticas"
    )

    def clean(self):
        """Validações customizadas do modelo"""
        super().clean()

        # Validação para garantir que pelo menos uma forma de identificação do solicitante exista
        if not self.aluno and not self.usuario:
            raise ValidationError(
                "Uma solicitação de desistência deve estar associada a um Aluno ou Usuário."
            )
        
        # Validação para evitar conflito de identificação
        if self.aluno and self.usuario:
            raise ValidationError(
                "Uma solicitação não pode ter um Aluno E um Usuário preenchidos simultaneamente."
            )

        # Validação da declaração final
        if not self.declaracao_final_acordo:
            raise ValidationError({
                "declaracao_final_acordo": "É necessário concordar com a declaração final."
            })

        # Validação condicional baseada no tipo de curso
        if self.curso and hasattr(self.curso, 'tipo_curso'):
            # Se for um curso de Ensino Médio Integrado, alguns documentos são obrigatórios
            if self.curso.tipo_curso == Curso.TipoCurso.EMI:
                if self.menor_idade and not self.doc_identificacao_responsavel:
                    raise ValidationError({
                        "doc_identificacao_responsavel": "Documento do responsável é obrigatório para menores de idade em cursos EMI."
                    })

        # Validação condicional para motivo de transferência
        if self.motivo_desistencia and hasattr(self.motivo_desistencia, 'descricao'):
            if 'transferência' in self.motivo_desistencia.descricao.lower():
                if not self.atestado_vaga_nova_escola:
                    raise ValidationError({
                        "atestado_vaga_nova_escola": "Atestado de vaga é obrigatório para transferências."
                    })

    def save(self, *args, **kwargs):
        """Sobrescreve o save para executar validações"""
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        """Representação string do objeto"""
        if self.aluno:
            return f"Desistência de Vaga - Aluno: {self.aluno.nome}"
        elif self.usuario:
            return f"Desistência de Vaga - Usuário: {self.usuario.first_name} {self.usuario.last_name}"
        else:
            return f"Desistência de Vaga - {self.nome_completo}"

    @property
    def tipo_solicitante(self):
        """Retorna o tipo do solicitante"""
        if self.aluno:
            return "aluno"
        elif self.usuario:
            # Verifica os grupos do usuário para determinar o tipo
            grupos = self.usuario.groups.values_list('name', flat=True)
            if 'externo' in grupos:
                return "externo"
            elif 'responsavel' in grupos:
                return "responsavel"
            else:
                return "usuario"
        return "indefinido"

    @property
    def nome_solicitante(self):
        """Retorna o nome do solicitante"""
        if self.aluno:
            return self.aluno.nome
        elif self.usuario:
            return f"{self.usuario.first_name} {self.usuario.last_name}".strip()
        else:
            return self.nome_completo

    @property
    def email_solicitante(self):
        """Retorna o email do solicitante"""
        if self.aluno and self.aluno.usuario:
            return self.aluno.usuario.email
        elif self.usuario:
            return self.usuario.email
        else:
            return self.email

    @property
    def curso_info(self):
        """Retorna informações do curso"""
        if self.curso:
            return {
                'codigo': self.curso.codigo,
                'nome': self.curso.nome,
                'tipo': self.curso.get_tipo_curso_display() if hasattr(self.curso, 'get_tipo_curso_display') else self.curso.tipo_curso
            }
        return None
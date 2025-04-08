from django.core.management.base import BaseCommand
from ...models import Curso, Ppc, MotivoAbono, MotivoDispensa, MotivoExercicios, Disciplina, Aluno
from ...models.tipo_falta import TipoFalta
from ...models.usuario import Usuario
from ...models.coordenador import Coordenador
from ...models.cre import CRE

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        curso1, _ = Curso.objects.get_or_create(
            codigo="ads",
            defaults={"nome": "Análise e Desenvolvimento de Sistemas"}
        )
        curso2, _ = Curso.objects.get_or_create(
            codigo="gdl",
            defaults={"nome": "Gestão Desportiva e Lazer"}
        )
        curso3, _ = Curso.objects.get_or_create(
            codigo="tur",
            defaults={"nome": "Turismo"}
        )
        curso4, _ = Curso.objects.get_or_create(
            codigo="esw",
            defaults={"nome": "Engenharia de Software"}
        )
        curso5, _ = Curso.objects.get_or_create(
            codigo="cc",
            defaults={"nome": "Ciência da Computação"}
        )


        Ppc.objects.get_or_create(
            codigo="ads/101.2018",
            defaults={"curso": curso1}
        )
        Ppc.objects.get_or_create(
            codigo="gdl/202.2020",
            defaults={"curso": curso2}
        )
        Ppc.objects.get_or_create(
            codigo="tur/303.2022",
            defaults={"curso": curso3}
        )
        Ppc.objects.get_or_create(
            codigo="esw/404.2021",
            defaults={"curso": curso4}
        )
        Ppc.objects.get_or_create(
            codigo="cc/505.2019",
            defaults={"curso": curso5}
        )


        MotivoAbono.objects.get_or_create(
            descricao="Doença com atestado médico válido",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Atividade acadêmica oficial da instituição",
            defaults={"tipo_falta": TipoFalta.FA}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Compromissos religiosos previamente informados",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Falecimento de parente de primeiro grau",
            defaults={"tipo_falta": TipoFalta.FA}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Comparecimento em audiências judiciais",
            defaults={"tipo_falta": TipoFalta.FJ}
        )


        MotivoDispensa.objects.get_or_create(
            descricao="Prática esportiva federada reconhecida"
        )
        MotivoDispensa.objects.get_or_create(
            descricao="Limitação física ou recomendação médica"
        )
        MotivoDispensa.objects.get_or_create(
            descricao="Emprego formal em horário conflitante"
        )
        MotivoDispensa.objects.get_or_create(
            descricao="Responsabilidades familiares ou domésticas"
        )
        MotivoDispensa.objects.get_or_create(
            descricao="Distância excessiva entre residência e campus"
        )


        MotivoExercicios.objects.get_or_create(
            descricao="Atividade profissional de tempo integral"
        )
        MotivoExercicios.objects.get_or_create(
            descricao="Estágio supervisionado obrigatório"
        )
        MotivoExercicios.objects.get_or_create(
            descricao="Serviço militar obrigatório"
        )
        MotivoExercicios.objects.get_or_create(
            descricao="Treinamento esportivo intensivo"
        )
        MotivoExercicios.objects.get_or_create(
            descricao="Participação em programa de intercâmbio acadêmico"
        )


        Disciplina.objects.get_or_create(
            nome="Desenvolvimento de Sistemas 2",
            codigo="DEVII"
        )
        Disciplina.objects.get_or_create(
            nome="Banco de Dados 1",
            codigo="BD1"
        )
        Disciplina.objects.get_or_create(
            nome="Engenharia de Software",
            codigo="ESW10"
        )
        Disciplina.objects.get_or_create(
            nome="Gestão de Projetos",
            codigo="GDP20"
        )
        Disciplina.objects.get_or_create(
            nome="Turismo Sustentável",
            codigo="TURS1"
        )


        usuario_coord, created = Usuario.objects.get_or_create(
            cpf="12345678901",  
            defaults={
                "email": "joao.silva@example.com",
                "nome": "João Silva",
                "telefone": "11987654321",
                "data_nascimento": "1990-01-01",
            }
        )
        if created:
            usuario_coord.set_password("senha123")
            usuario_coord.save()

        usuario_cre, created = Usuario.objects.get_or_create(
            cpf="10987654321", 
            defaults={
                "email": "maria.souza@example.com",
                "nome": "Maria Souza",
                "telefone": "21987654321",
                "data_nascimento": "1995-05-20",
            }
        )
        if created:
            usuario_cre.set_password("senha456")
            usuario_cre.save()

        Coordenador.objects.get_or_create(
            usuario=usuario_coord,
            defaults={
                "siape": 123456,
                "inicio_mandato": "2025-01-01",
                "fim_mandato": "2026-01-01",
                "curso": curso1,
            }
        )

        CRE.objects.get_or_create(
            usuario=usuario_cre,
            defaults={"siape": 654321}
        )
                
        usuario_aluno, created = Usuario.objects.get_or_create(
            cpf="11122233344",  # CPF com 11 dígitos (único)
            defaults={
                "email": "aluno.exemplo@example.com",
                "nome": "Aluno Exemplo",
                "telefone": "11955556666",
                "data_nascimento": "2000-01-01",
            }
        )
        if created:
            usuario_aluno.set_password("alunosenha")
            usuario_aluno.save()

        # Criação ou obtenção do registro de Aluno
        Aluno.objects.get_or_create(
            usuario=usuario_aluno,
            defaults={
                "matricula": "2023123456",
                "turma": "Turma A",
                "ano_ingresso": 2023,
            }
        )

        self.stdout.write(self.style.SUCCESS("Dados cadastrados com sucesso!"))
from django.core.management.base import BaseCommand
from ...models import Curso, Ppc, MotivoAbono, MotivoDispensa, MotivoExercicios, Disciplina
from ...models.tipo_falta import TipoFalta

class Command(BaseCommand):
    help = 'Popula o banco com cursos, PPCs e motivos iniciais'

    def handle(self, *args, **kwargs):
        # Cursos
        curso1 = Curso.objects.create(nome="Análise e Desenvolvimento de Sistemas", codigo="ads")
        curso2 = Curso.objects.create(nome="Gestão Desportiva e Lazer", codigo="gdl")
        curso3 = Curso.objects.create(nome="Turismo", codigo="tur")
        curso4 = Curso.objects.create(nome="Engenharia de Software", codigo="esw")
        curso5 = Curso.objects.create(nome="Ciência da Computação", codigo="cc")

        # PPCs
        Ppc.objects.create(codigo="ads/101.2018", curso=curso1)
        Ppc.objects.create(codigo="gdl/202.2020", curso=curso2)
        Ppc.objects.create(codigo="tur/303.2022", curso=curso3)
        Ppc.objects.create(codigo="esw/404.2021", curso=curso4)
        Ppc.objects.create(codigo="cc/505.2019", curso=curso5)

        # Motivos de Abono
        MotivoAbono.objects.create(descricao="Doença com atestado médico válido", tipo_falta=TipoFalta.FJ)
        MotivoAbono.objects.create(descricao="Atividade acadêmica oficial da instituição", tipo_falta=TipoFalta.FA)
        MotivoAbono.objects.create(descricao="Compromissos religiosos previamente informados", tipo_falta=TipoFalta.FJ)
        MotivoAbono.objects.create(descricao="Falecimento de parente de primeiro grau", tipo_falta=TipoFalta.FA)
        MotivoAbono.objects.create(descricao="Comparecimento em audiências judiciais", tipo_falta=TipoFalta.FJ)

        # Motivos de Dispensa
        MotivoDispensa.objects.create(descricao="Prática esportiva federada reconhecida")
        MotivoDispensa.objects.create(descricao="Limitação física ou recomendação médica")
        MotivoDispensa.objects.create(descricao="Emprego formal em horário conflitante")
        MotivoDispensa.objects.create(descricao="Responsabilidades familiares ou domésticas")
        MotivoDispensa.objects.create(descricao="Distância excessiva entre residência e campus")

        # Motivos de Exercícios
        MotivoExercicios.objects.create(descricao="Atividade profissional de tempo integral")
        MotivoExercicios.objects.create(descricao="Estágio supervisionado obrigatório")
        MotivoExercicios.objects.create(descricao="Serviço militar obrigatório")
        MotivoExercicios.objects.create(descricao="Treinamento esportivo intensivo")
        MotivoExercicios.objects.create(descricao="Participação em programa de intercâmbio acadêmico")

        # Disciplinas
        Disciplina.objects.create(nome="Desenvolvimento de Sistemas 2", codigo="DEVII")
        Disciplina.objects.create(nome="Banco de Dados 1", codigo="BD1")
        Disciplina.objects.create(nome="Engenharia de Software", codigo="ESW10")
        Disciplina.objects.create(nome="Gestão de Projetos", codigo="GDP20")
        Disciplina.objects.create(nome="Turismo Sustentável", codigo="TURS1")

        self.stdout.write(self.style.SUCCESS("Dados cadastrados com sucesso!"))

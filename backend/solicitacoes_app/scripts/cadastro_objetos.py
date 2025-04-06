from ..models import Curso, Ppc, MotivoAbono, MotivoDispensa, MotivoExercicios
from ..models.tipo_falta import TipoFalta

# Cursos
curso1 = Curso.objects.create(nome="Análise e Desenvolvimento de Sistemas", codigo="ads")
curso2 = Curso.objects.create(nome="Gestão Desportiva e Lazer", codigo="gdl")
curso3 = Curso.objects.create(nome="Turismo", codigo="tur")
curso4 = Curso.objects.create(nome="Engenharia de Software", codigo="esw")
curso5 = Curso.objects.create(nome="Ciência da Computação", codigo="cc")

# PPCs
ppc1 = Ppc.objects.create(codigo="ads/101.2018", curso=curso1)
ppc2 = Ppc.objects.create(codigo="gdl/202.2020", curso=curso2)
ppc3 = Ppc.objects.create(codigo="tur/303.2022", curso=curso3)
ppc4 = Ppc.objects.create(codigo="esw/404.2021", curso=curso4)
ppc5 = Ppc.objects.create(codigo="cc/505.2019", curso=curso5)

# Motivos de Abono
abono1 = MotivoAbono.objects.create(descricao="Doença com atestado médico válido", tipo_falta=TipoFalta.FJ)
abono2 = MotivoAbono.objects.create(descricao="Atividade acadêmica oficial da instituição", tipo_falta=TipoFalta.FA)
abono3 = MotivoAbono.objects.create(descricao="Compromissos religiosos previamente informados", tipo_falta=TipoFalta.FJ)
abono4 = MotivoAbono.objects.create(descricao="Falecimento de parente de primeiro grau", tipo_falta=TipoFalta.FA)
abono5 = MotivoAbono.objects.create(descricao="Comparecimento em audiências judiciais", tipo_falta=TipoFalta.FJ)

# Motivos de Dispensa
dispensa1 = MotivoDispensa.objects.create(descricao="Prática esportiva federada reconhecida")
dispensa2 = MotivoDispensa.objects.create(descricao="Limitação física ou recomendação médica")
dispensa3 = MotivoDispensa.objects.create(descricao="Emprego formal em horário conflitante")
dispensa4 = MotivoDispensa.objects.create(descricao="Responsabilidades familiares ou domésticas")
dispensa5 = MotivoDispensa.objects.create(descricao="Distância excessiva entre residência e campus")

# Motivos de Exercícios
exercicio1 = MotivoExercicios.objects.create(descricao="Atividade profissional de tempo integral")
exercicio2 = MotivoExercicios.objects.create(descricao="Estágio supervisionado obrigatório")
exercicio3 = MotivoExercicios.objects.create(descricao="Serviço militar obrigatório")
exercicio4 = MotivoExercicios.objects.create(descricao="Treinamento esportivo intensivo")
exercicio5 = MotivoExercicios.objects.create(descricao="Participação em programa de intercâmbio acadêmico")

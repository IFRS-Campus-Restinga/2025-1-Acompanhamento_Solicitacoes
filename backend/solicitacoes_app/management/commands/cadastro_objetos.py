from django.core.management.base import BaseCommand
from ...models import Curso, Ppc, MotivoAbono, MotivoDispensa, MotivoExercicios, Disciplina, Aluno, Turma, Nome, CalendarioAcademico
from ...models.tipo_falta import TipoFalta
from ...models.usuario import Usuario
from ...models.coordenador import Coordenador
from ...models.mandato import Mandato
from ...models.cre import CRE
from django.contrib.auth.models import Group
 
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


        ppc1, _ = Ppc.objects.get_or_create(
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
            descricao="Problema de saúde, através de documento oficial, carimbado e assinado",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Obrigações com o Serviço Militar",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Falecimento de parente em até 2º grau",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Convocação pelo Poder Judiciário",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Nascimento de filho ou adoção",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Atividades laborais em dia de verificação de aprendizagem, " \
            "quando for realizada fora do turno/dia regular do curso",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Situação de risco social evidenciada por meio de parecer social original, " \
            "emitido por Assistente Social de órgão oficial, preferencialmente proveniente da " \
            "Coordenadoria de Assistência Estudantil do Campus",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Exercício ou Manobra a serviço de Órgão de Formação de Reserva",
            defaults={"tipo_falta": TipoFalta.FA}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Quando o estudante representar oficialmente o IFRS em eventos",
            defaults={"tipo_falta": TipoFalta.FA}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Participação em atividade institucional, convocado pelo IFRS",
            defaults={"tipo_falta": TipoFalta.FA}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Representação desportiva nacional, conforme Art. 85 da Lei n° 9.615/98",
            defaults={"tipo_falta": TipoFalta.FA}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Convocação para Audiência Judicial",
            defaults={"tipo_falta": TipoFalta.FA}
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

        ads = Ppc.objects.get(codigo="ads/101.2018")
        Disciplina.objects.get_or_create(
            nome="Desenvolvimento de Sistemas 2",
            codigo="DEVII",
            defaults={"ppc": ads}
        )
        Disciplina.objects.get_or_create(
            nome="Banco de Dados 1",
            codigo="BD1",
            defaults={"ppc": ads}
        )
        Disciplina.objects.get_or_create(
            nome="Engenharia de Software",
            codigo="ESW10",
            defaults={"ppc": ads}
        )
        Disciplina.objects.get_or_create(
            nome="Gestão de Projetos",
            codigo="GDP20",
            defaults={"ppc": ads}
        )
        Disciplina.objects.get_or_create(
            nome="Turismo Sustentável",
            codigo="TURS1",
            defaults={"ppc": ads}
        )

        CalendarioAcademico.objects.get_or_create(
            codigo= "2025-2",
            formulario= "TRANCAMENTODISCIPLINA",
            tipo_curso= "GRADUACAO",
            data_inicio= "2025-03-01",
            data_fim= "2025-08-30",
            ativo= True
        )

        Turma.objects.get_or_create(
            nome="Primeiro ano"
        )
        Turma.objects.get_or_create(
            nome="Segundo ano"
        )
        Turma.objects.get_or_create(
            nome="Terceiro ano"
        )
        Turma.objects.get_or_create(
            nome="Quarto ano"
        )
        Turma.objects.get_or_create(
            nome="Quinto ano"
        )

        Nome.objects.get_or_create(
            nome="Fernando"
        )
        Nome.objects.get_or_create(
            nome="Carol"
        )
        Nome.objects.get_or_create(
            nome="Clarke"
        )
        Nome.objects.get_or_create(
            nome="Pedro"
        )
        Nome.objects.get_or_create(
            nome="Nicolas"
        )
        
        Group.objects.get_or_create(
            name="Usuários"
        )
        Group.objects.get_or_create(
            name="CRE"
        )
        Group.objects.get_or_create(
            name="Coordenador"
        )
        Group.objects.get_or_create(
            name="Aluno"
        )
        
        #NÃO EXCLUA PLEASE - ADICIONAR DISCIPLINA EM TURMA p/ solic exercicios dom
        # Associar disciplinas a uma turma: 
        try:
            turma_primeiro_ano = Turma.objects.get(nome="Primeiro ano")
            disciplina_bd1 = Disciplina.objects.get(codigo="BD1")

            # Adiciona as disciplinas à turma
            turma_primeiro_ano.disciplinas.add(disciplina_bd1)
            # Pode adicionar mais disciplinas conforme necessário

            self.stdout.write(self.style.SUCCESS(f"Disciplinas associadas à turma '{turma_primeiro_ano.nome}'"))

            turma_segundo_ano = Turma.objects.get(nome="Segundo ano")
            disciplina_dev_sistemas = Disciplina.objects.get(codigo="DEVII")
            turma_segundo_ano.disciplinas.add(disciplina_dev_sistemas )
            self.stdout.write(self.style.SUCCESS(f"Disciplinas associadas à turma '{turma_segundo_ano.nome}'"))

            turma_terceiro_ano = Turma.objects.get(nome="Terceiro ano")
            disciplina_Esw = Disciplina.objects.get(codigo="ESW10")
            turma_terceiro_ano.disciplinas.add(disciplina_Esw)
            self.stdout.write(self.style.SUCCESS(f"Disciplinas associadas à turma '{turma_terceiro_ano.nome}'"))

            turma_quarto_ano = Turma.objects.get(nome="Quarto ano")
            disciplina_tur = Disciplina.objects.get(codigo="TURS1")
            turma_quarto_ano.disciplinas.add(disciplina_tur)
            self.stdout.write(self.style.SUCCESS(f"Disciplinas associadas à turma '{turma_quarto_ano.nome}'"))

            turma_quinto_ano = Turma.objects.get(nome="Quinto ano")
            disciplina_gestao = Disciplina.objects.get(codigo="GDP20")
            turma_quinto_ano.disciplinas.add(disciplina_gestao)
            self.stdout.write(self.style.SUCCESS(f"Disciplinas associadas à turma '{turma_quinto_ano.nome}'"))

        except Turma.DoesNotExist:
            self.stdout.write(self.style.ERROR("Uma ou mais turmas não encontradas para associar disciplinas."))
        except Disciplina.DoesNotExist:
            self.stdout.write(self.style.ERROR("Uma ou mais disciplinas não encontradas para associar às turmas."))


        
        usuario_coord, created = Usuario.objects.get_or_create(
            cpf="42244866017",  
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
            cpf="88887783063", 
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

        
        coordenador1, created = Coordenador.objects.get_or_create(
            usuario=usuario_coord,
            defaults={"siape": 123456}
        )
        
        mandato1, created = Mandato.objects.get_or_create(
            curso=curso2, 
            coordenador=coordenador1,
            inicio_mandato="2023-01-15",
            defaults={
                "fim_mandato": "2024-01-14" # Opcional, pode ser None
            }
        )
        
        mandato2, created = Mandato.objects.get_or_create(
            curso=curso5, 
            coordenador=coordenador1,
            inicio_mandato="2025-01-15",
            defaults={
                "fim_mandato": "2025-12-14" # Opcional, pode ser None
            }
        )

        CRE.objects.get_or_create(
            usuario=usuario_cre,
            defaults={"siape": 654321}
        )
                
        usuario_aluno, created = Usuario.objects.get_or_create(
            cpf="32707706000",  # CPF com 11 dígitos (único)
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
                "ppc": ppc1,
                "ano_ingresso": 2023,
            }
        )

        self.stdout.write(self.style.SUCCESS("Dados cadastrados com sucesso!"))
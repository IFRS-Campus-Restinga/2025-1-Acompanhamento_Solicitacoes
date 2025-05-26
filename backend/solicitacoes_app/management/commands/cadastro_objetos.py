from django.core.management.base import BaseCommand

from ...models import Curso, Ppc, MotivoAbono, MotivoDispensa, MotivoExercicios, Disciplina, Aluno, Turma, Nome
from ...models.tipo_falta import TipoFalta
from ...models.usuario import Usuario
from ...models.coordenador import Coordenador
from ...models.mandato import Mandato
from ...models.cre import CRE
from django.contrib.auth.models import Group
from ...models.periodo_disciplina import PeriodoDisciplina

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        curso1, _ = Curso.objects.get_or_create(
            codigo="ads",
            tipo_periodo=Curso.TipoPeriodo.SEMESTRAL,
            defaults={"nome": "Análise e Desenvolvimento de Sistemas"}
        )
        curso2, _ = Curso.objects.get_or_create(
            codigo="gdl",
            tipo_periodo=Curso.TipoPeriodo.SEMESTRAL,
            defaults={"nome": "Gestão Desportiva e Lazer"}
        )
        curso3, _ = Curso.objects.get_or_create(
            codigo="tur",
            tipo_periodo=Curso.TipoPeriodo.SEMESTRAL,
            defaults={"nome": "Turismo"}
        )
        curso4, _ = Curso.objects.get_or_create(
            codigo="esw",
            tipo_periodo=Curso.TipoPeriodo.SEMESTRAL,
            defaults={"nome": "Engenharia de Software"}
        )
        curso5, _ = Curso.objects.get_or_create(
            codigo="cc",
            tipo_periodo=Curso.TipoPeriodo.SEMESTRAL,
            defaults={"nome": "Ciência da Computação"}
        )
        
        curso6, _ = Curso.objects.get_or_create(
            codigo="tecinfo",
            tipo_periodo=Curso.TipoPeriodo.ANUAL,
            defaults={"nome": "Técnico de Informática"}
        )
        
        curso7, _ = Curso.objects.get_or_create(
            codigo="art",
            tipo_periodo=Curso.TipoPeriodo.ANUAL,
            defaults={"nome": "Artesanato"}
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
        Ppc.objects.get_or_create(
            codigo="tecinfo/606.2025",
            defaults={"curso": curso6}
        )
        Ppc.objects.get_or_create(
            codigo="art/707.2024",
            defaults={"curso": curso7}
        )

        # Motivos de Abono
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
            descricao="Atividades laborais em dia de verificação de aprendizagem, quando for realizada fora do turno/dia regular do curso",
            defaults={"tipo_falta": TipoFalta.FJ}
        )
        MotivoAbono.objects.get_or_create(
            descricao="Situação de risco social evidenciada por meio de parecer social original, emitido por Assistente Social de órgão oficial, preferencialmente proveniente da Coordenadoria de Assistência Estudantil do Campus",
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

        # Motivos de Dispensa
        MotivoDispensa.objects.get_or_create(descricao="Prática esportiva federada reconhecida")
        MotivoDispensa.objects.get_or_create(descricao="Limitação física ou recomendação médica")
        MotivoDispensa.objects.get_or_create(descricao="Emprego formal em horário conflitante")
        MotivoDispensa.objects.get_or_create(descricao="Responsabilidades familiares ou domésticas")
        MotivoDispensa.objects.get_or_create(descricao="Distância excessiva entre residência e campus")

        # Motivos de Exercícios
        MotivoExercicios.objects.get_or_create(descricao="Atividade profissional de tempo integral")
        MotivoExercicios.objects.get_or_create(descricao="Estágio supervisionado obrigatório")
        MotivoExercicios.objects.get_or_create(descricao="Serviço militar obrigatório")
        MotivoExercicios.objects.get_or_create(descricao="Treinamento esportivo intensivo")
        MotivoExercicios.objects.get_or_create(descricao="Participação em programa de intercâmbio acadêmico")

        # Disciplinas do PPC de ADS
        ads = Ppc.objects.get(codigo="ads/101.2018")
        Disciplina.objects.get_or_create(
            nome="Desenvolvimento de Sistemas 2", codigo="DEVII",
            defaults={"ppc": ads, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Banco de Dados 1", codigo="BD1",
            defaults={"ppc": ads, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Engenharia de Software", codigo="ESW10",
            defaults={"ppc": ads, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Gestão de Projetos", codigo="GDP20",
            defaults={"ppc": ads, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Turismo Sustentável", codigo="TURS1",
            defaults={"ppc": ads, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        
        # Disciplinas do PPC de Técnico de Informática

        tecinfo_ppc = Ppc.objects.get(codigo="tecinfo/606.2025")
        
        Disciplina.objects.get_or_create(
            nome="Redes de Computadores", codigo="REDES1",
            defaults={"ppc": tecinfo_ppc, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Manutenção de Computadores", codigo="MANUT1",
            defaults={"ppc": tecinfo_ppc, "periodo": PeriodoDisciplina.PRIMEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Programação Básica", codigo="PROGBAS",
            defaults={"ppc": tecinfo_ppc, "periodo": PeriodoDisciplina.SEGUNDO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Sistemas Operacionais", codigo="SOP1",
            defaults={"ppc": tecinfo_ppc, "periodo": PeriodoDisciplina.SEGUNDO_ANO}
        )

        # Disciplinas do PPC de Artesanato
        art_ppc = Ppc.objects.get(codigo="art/707.2024")
        
        Disciplina.objects.get_or_create(
            nome="Técnicas Artesanais", codigo="TART01",
            defaults={"ppc": art_ppc, "periodo": PeriodoDisciplina.TERCEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="História da Arte", codigo="HISTART",
            defaults={"ppc": art_ppc, "periodo": PeriodoDisciplina.TERCEIRO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Gestão de Pequenos Negócios", codigo="GPN01",
            defaults={"ppc": art_ppc, "periodo": PeriodoDisciplina.QUARTO_ANO}
        )
        Disciplina.objects.get_or_create(
            nome="Empreendedorismo Criativo", codigo="EMPCRTV",
            defaults={"ppc": art_ppc, "periodo": PeriodoDisciplina.QUARTO_ANO}
        )
        
        
        # # Calendário
        # CalendarioAcademico.objects.get_or_create(
        #     codigo="2025-2",
        #     formulario="TRANCAMENTODISCIPLINA",
        #     tipo_curso="GRADUACAO",
        #     data_inicio="2025-03-01",
        #     data_fim="2025-08-30",
        #     ativo=True
        # )

        # Turmas
        for nome_turma in ["Primeiro ano", "Segundo ano", "Terceiro ano", "Quarto ano", "Quinto ano"]:
            Turma.objects.get_or_create(nome=nome_turma)


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
        

        # Nomes
        for nome in ["Fernando", "Carol", "Clarke", "Pedro", "Nicolas"]:
            Nome.objects.get_or_create(nome=nome)

        # Grupos
        for nome in ["Usuários", "CRE", "Coordenador", "Aluno"]:
            Group.objects.get_or_create(name=nome)

        # Usuário Coordenador
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

        # Usuário CRE
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

        coordenador1, _ = Coordenador.objects.get_or_create(
            usuario=usuario_coord,
            defaults={"siape": 123456}
        )

        Mandato.objects.get_or_create(
            curso=curso2,
            coordenador=coordenador1,
            inicio_mandato="2023-01-15",
            defaults={"fim_mandato": "2024-01-14"}
        )
        Mandato.objects.get_or_create(
            curso=curso5,
            coordenador=coordenador1,
            inicio_mandato="2025-01-15",
            defaults={"fim_mandato": "2025-12-14"}
        )

        CRE.objects.get_or_create(
            usuario=usuario_cre,
            defaults={"siape": 654321}
        )

        # Aluno base
        usuario_aluno, created = Usuario.objects.get_or_create(
            cpf="32707706000",
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

        Aluno.objects.get_or_create(
            usuario=usuario_aluno,
            defaults={
                "matricula": "2023123456",
                "ppc": ppc1,
                "ano_ingresso": 2023,
            }
        )

        # Criação de 2 alunos por curso
        cursos = [curso1, curso2, curso3, curso4, curso5]
        ppcs = {
            "ads": Ppc.objects.get(codigo="ads/101.2018"),
            "gdl": Ppc.objects.get(codigo="gdl/202.2020"),
            "tur": Ppc.objects.get(codigo="tur/303.2022"),
            "esw": Ppc.objects.get(codigo="esw/404.2021"),
            "cc":  Ppc.objects.get(codigo="cc/505.2019"),
        }

        for curso in cursos:
            for i in range(1, 3):
                cpf = f"000000000{curso.codigo[-1]}{i}"
                email = f"aluno{i}.{curso.codigo}@example.com"
                nome = f"Aluno {i} ({curso.nome})"
                usuario, created = Usuario.objects.get_or_create(
                    cpf=cpf.zfill(11),
                    defaults={
                        "email": email,
                        "nome": nome,
                        "telefone": f"11900000{curso.codigo[-1]}{i}",
                        "data_nascimento": "2001-01-01",
                    }
                )
                if created:
                    usuario.set_password("senhaaluno")
                    usuario.save()

                Aluno.objects.get_or_create(
                    usuario=usuario,
                    defaults={
                        "matricula": f"2023{curso.codigo.upper()}{i}",
                        "ppc": ppcs[curso.codigo],
                        "ano_ingresso": 2023,
                    }
                )

        self.stdout.write(self.style.SUCCESS("Dados cadastrados com sucesso!"))
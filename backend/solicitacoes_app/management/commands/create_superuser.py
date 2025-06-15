from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date

class Command(BaseCommand):
    
    help = 'Cria um superusuário com dados pré-definidos'

    def handle(self, *args, **options):
        User = get_user_model()

        # Dados do superusuário (altere conforme necessário)
        ADMIN_EMAIL = "admin@email.com"
        ADMIN_PASSWORD = "admin"
        ADMIN_NOME = "Admin"
        ADMIN_CPF = "12345668901"    # Deve conter exatamente 11 dígitos
        ADMIN_TELEFONE = "11999999999"    # 10 ou 11 dígitos
        ADMIN_DATA_NASCIMENTO = date(1970, 1, 1)

        usuario_existente = User.objects.filter(email=ADMIN_EMAIL).first()
        cpf_existente = User.objects.filter(cpf=ADMIN_CPF).first()
        telefone_existente = User.objects.filter(telefone=ADMIN_TELEFONE).first()

        if usuario_existente:
            self.stdout.write(self.style.WARNING(f"Já existe um usuário com o email '{ADMIN_EMAIL}'."))
        if cpf_existente:
            self.stdout.write(self.style.WARNING(f"Já existe um usuário com o CPF '{ADMIN_CPF}'."))
        if telefone_existente:
            self.stdout.write(self.style.WARNING(f"Já existe um usuário com o telefone '{ADMIN_TELEFONE}'."))

        if not any([usuario_existente, cpf_existente, telefone_existente]):
            User.objects.create_superuser(
                email=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                nome=ADMIN_NOME,
                cpf=ADMIN_CPF,
                telefone=ADMIN_TELEFONE,
                data_nascimento=ADMIN_DATA_NASCIMENTO
            )
            self.stdout.write(self.style.SUCCESS(f"Superusuário '{ADMIN_EMAIL}' criado com sucesso!"))
        else:
            self.stdout.write(self.style.ERROR("Criação do superusuário cancelada devido a conflito de dados únicos."))
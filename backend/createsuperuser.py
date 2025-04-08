import os
import django
from datetime import date

# Define a variável de ambiente para apontar para o settings do Django.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Dados do superusuário (altere conforme necessário)
ADMIN_EMAIL = "admin@email.com"
ADMIN_PASSWORD = "adminpassword123"
ADMIN_NOME = "Admin"
ADMIN_CPF = "12345678901"          # Deve conter exatamente 11 dígitos
ADMIN_TELEFONE = "11999999999"      # 10 ou 11 dígitos
ADMIN_DATA_NASCIMENTO = date(1970, 1, 1)

# Verifica se o usuário com este e-mail já existe
if not User.objects.filter(email=ADMIN_EMAIL).exists():
    User.objects.create_superuser(
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
        nome=ADMIN_NOME,
        cpf=ADMIN_CPF,
        telefone=ADMIN_TELEFONE,
        data_nascimento=ADMIN_DATA_NASCIMENTO
    )
    print(f"Superuser '{ADMIN_EMAIL}' criado com sucesso!")
else:
    print(f"Superuser '{ADMIN_EMAIL}' já existe.")

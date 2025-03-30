import os
import sys

# Ajuste o sys.path para incluir a raiz do projeto (onde está o manage.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, '..', '..')  # Sobe dois níveis
sys.path.insert(0, project_root)

# Configure o módulo de settings do Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # Ajuste conforme sua estrutura

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Obtenha as credenciais do superusuário a partir de variáveis de ambiente (ou defina valores padrão)
username = os.environ.get("DJANGO_ADMIN_USERNAME", "admin")
email = os.environ.get("DJANGO_ADMIN_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_ADMIN_PASSWORD", "adminpassword")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superusuário criado com sucesso!")
else:
    print("Superusuário já existe!")

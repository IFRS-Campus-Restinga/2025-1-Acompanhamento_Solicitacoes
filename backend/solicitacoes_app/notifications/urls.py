# solicitacoes_app/notifications/urls.py
from django.urls import path
from solicitacoes_app.notifications.views import SimulateNotificationAPIView # Importe de forma relativa

urlpatterns = [
    path('simulate/', SimulateNotificationAPIView.as_view(), name='simulate_notification'),
]

# http://localhost:8000/solicitacoes/notifications/simulate/

# SIMULAÇÃO DO COORDENADOR RECEBENDO UMA NOVA SOLICITAÇÃO
#{
#    "cenario": "nova_submissao_coordenador",
#    "nome_remetente": "Maria Teste",
#    "id_submissao": "FORM-789",
#    "email_coordenador": "coordenador@exemplo.com"
#}

# SIMULAÇÃO DO ALUNO SENDO INFORMADO DE ATUALIZAÇÕES NA SOLICITAÇÃO
#{
#    "cenario": "atualizacao_status_usuario",
#    "email_usuario": "aluno@exemplo.com",
#    "id_submissao": "SOL-123",
#    "novo_status": "Deferida",
#    "mensagem_status": "Sua solicitação foi aprovada. Acesse o portal para mais detalhes."
#}
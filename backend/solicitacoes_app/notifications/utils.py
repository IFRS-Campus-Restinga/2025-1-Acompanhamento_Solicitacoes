# solicitacoes_app/notifications/utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import os

def send_notification_email(subject, template_name, context, recipient_email):
    """
    Função genérica para enviar e-mails de notificação usando templates HTML.
    Os prints simulam o envio sem realmente disparar e-mails.
    """
    try:
        # Pega o email remetente das configurações, ou um valor padrão para simulação
        from_email = os.environ.get('DEFAULT_FROM_EMAIL', getattr(settings, 'DEFAULT_FROM_EMAIL', 'simulated@example.com'))

        # Renderiza o template HTML e gera a versão em texto puro
        html_message = render_to_string(template_name, context)
        plain_message = strip_tags(html_message)

        # --- SAÍDA FORMATADA E LIMPA NO TERMINAL PARA APRESENTAÇÃO ---
        print("\n" + "="*70)
        print(" NOTIFICAÇÃO DE E-MAIL SIMULADA ")
        print("="*70)
        print(f" Assunto: {subject}")
        print(f" Para: {recipient_email}")
        print(f" De: {from_email}")
        print("-" * 70)
        # Imprime o conteúdo do e-mail em texto puro, que é o que o destinatário veria
        print(plain_message.strip())
        print("="*70 + "\n")
        # --- FIM DA SAÍDA FORMATADA ---

        # Em uma implementação real, você descomentaria a linha abaixo para enviar o e-mail:
        # send_mail(
        #     subject=subject,
        #     message=plain_message,
        #     from_email=from_email,
        #     recipient_list=[recipient_email],
        #     html_message=html_message,
        #     fail_silently=False,
        # )
        return True
    except Exception as e:
        print(f"ERRO SIMULADO na Notificação: Falha ao processar e-mail para {recipient_email}. Detalhes: {e}")
        return False

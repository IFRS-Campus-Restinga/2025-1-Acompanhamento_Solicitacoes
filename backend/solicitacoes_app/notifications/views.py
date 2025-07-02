# solicitacoes_app/notifications/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Importe a função de envio do seu novo módulo 'notifications'
from solicitacoes_app.notifications.utils import send_notification_email

class SimulateNotificationAPIView(APIView):
    """
    Esta view serve apenas para simular o disparo de notificações
    e demonstrar como a função send_notification_email seria usada
    em diferentes cenários.
    """
    def post(self, request, *args, **kwargs):
        # Usando nomenclatura em português para as chaves do payload (dados de entrada)
        cenario = request.data.get('cenario', 'padrao')
        email_destinatario = request.data.get('email_destinatario', 'teste@exemplo.com')
        sucesso = False
        mensagem_retorno = "Cenário de notificação simulado com sucesso."

        # Definindo os caminhos dos templates HTML
        template_coordenador = "solicitacoes_app/email_templates/coordinator_notification.html"
        template_padrao = "solicitacoes_app/email_templates/default_notification.html"


        if cenario == 'nova_submissao_coordenador':
            # Simular dados que viriam de uma nova submissão genérica para o coordenador
            nome_remetente = request.data.get('nome_remetente', 'Nome Desconhecido')
            id_submissao = request.data.get('id_submissao', 'REQ-987')
            email_coordenador = request.data.get('email_coordenador', 'coordenador@exemplo.com') # Email do coordenador para teste

            if email_coordenador:
                contexto = {
                    'action_type': 'Nova Submissão para Análise',
                    'entity_description': f'Submissão ID {id_submissao} de {nome_remetente}',
                    'entity_id': id_submissao,
                    'user_name': 'Coordenador(a)', # Nome genérico para o coordenador no template
                    'link': f"http://localhost:3000/submissao/{id_submissao}", # Exemplo URL do frontend
                    'subject': f"Atenção: Nova Submissão Pendente - ID {id_submissao}" # Assunto do e-mail
                }
                sucesso = send_notification_email(
                    subject=contexto['subject'], # Usa o assunto do contexto
                    template_name=template_coordenador, # Usa o template específico do coordenador
                    context=contexto,
                    recipient_email=email_coordenador
                )
            else:
                mensagem_retorno = "Email do coordenador não fornecido para simulação."
                sucesso = False

        elif cenario == 'atualizacao_status_usuario':
            # Simular dados de uma atualização de status para o usuário que fez a submissão
            email_usuario = request.data.get('email_usuario', 'usuario@exemplo.com') # Email do usuário para teste
            id_submissao = request.data.get('id_submissao', 'REQ-987')
            novo_status = request.data.get('novo_status', 'Concluída')
            mensagem_status = request.data.get('mensagem_status', 'Sua submissão foi processada com sucesso.')

            if email_usuario:
                contexto = {
                    'user_name': 'Prezado(a) Usuário(a)', # Nome genérico para o usuário no template
                    'event_type': 'Atualização de Status de Submissão',
                    'message_content': f'Sua submissão de ID {id_submissao} está agora com o status: **{novo_status}**. {mensagem_status}',
                    'link': f"http://localhost:3000/submissao/{id_submissao}",
                    'link_text': 'Acompanhar Minha Submissão',
                    'subject': f"Status Atualizado: Submissão ID {id_submissao}: {novo_status}" # Assunto do e-mail
                }
                sucesso = send_notification_email(
                    subject=contexto['subject'], # Usa o assunto do contexto
                    template_name=template_padrao, # Usa o template padrão para o usuário
                    context=contexto,
                    recipient_email=email_usuario
                )
            else:
                mensagem_retorno = "Email do usuário não fornecido para simulação."
                sucesso = False

        elif cenario == 'coordenador_notifica_cre':
            # Simular notificação para a CRE (Coordenação de Registro Escolar)
            email_cre = request.data.get('email_cre', 'cre@exemplo.com') # Email da CRE para teste
            id_submissao = request.data.get('id_submissao', 'REQ-987')
            informacao_cre = request.data.get('informacao_cre', 'Por favor, registre esta ação no sistema interno.')

            if email_cre:
                contexto = {
                    'user_name': 'Equipe CRE',
                    'event_type': 'Ação para Registro Interno',
                    'message_content': f'Uma nova ação (ID: {id_submissao}) requer registro. Detalhes: {informacao_cre}',
                    'link': f"http://localhost:3000/admin/registro/{id_submissao}",
                    'link_text': 'Acessar Registro'
                }
                sucesso = send_notification_email(
                    subject=f"Registro Pendente CRE - Submissão ID {id_submissao}",
                    template_name=template_padrao, # Usando o template padrão para a CRE
                    context=contexto,
                    recipient_email=email_cre
                )
            else:
                mensagem_retorno = "Email da CRE não fornecido para simulação."
                sucesso = False

        else:
            mensagem_retorno = "Cenário de simulação não reconhecido ou inválido."
            sucesso = False

        if sucesso:
            return Response({"status": "sucesso", "mensagem": mensagem_retorno}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "erro", "mensagem": mensagem_retorno}, status=status.HTTP_400_BAD_REQUEST)
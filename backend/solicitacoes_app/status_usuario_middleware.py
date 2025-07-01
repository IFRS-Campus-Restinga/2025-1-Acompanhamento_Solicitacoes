from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
import logging

# Configurar logger
logger = logging.getLogger(__name__)

class AtualizarStatusUsuarioMiddleware(MiddlewareMixin):
    """
    Middleware para atualizar automaticamente o status do usuário de NOVO para ATIVO, 
    quando realiza requisições POST, PUT, PATCH ou DELETE.
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        logger.info("[Middleware] AtualizarStatusUsuarioMiddleware inicializado")
    
    def process_response(self, request, response):
        # Log inicial
        logger.info(f"[Middleware] Processando resposta: {request.method} {request.path}")
        logger.info(f"[Middleware] Tipo de request.user: {type(request.user)}")
        logger.info(f"[Middleware] request.user.is_authenticated: {getattr(request.user, 'is_authenticated', False)}")
        
        # Verificar se é uma requisição de alteração (não GET ou HEAD)
        if request.method not in ['GET', 'HEAD', 'OPTIONS']:
            logger.info(f"[Middleware] Requisição de alteração detectada: {request.method}")
            
            # Verificar se o usuário está autenticado
            if hasattr(request, 'user') and request.user and not isinstance(request.user, AnonymousUser):
                logger.info(f"[Middleware] Usuário autenticado: {request.user}")
                
                # Verificar se o usuário tem o atributo status_usuario
                if hasattr(request.user, 'status_usuario'):
                    logger.info(f"[Middleware] Status atual do usuário: {request.user.status_usuario}")
                    
                    # Verificar se o usuário tem status NOVO
                    if request.user.status_usuario == 'NOVO':
                        logger.info(f"[Middleware] Atualizando status do usuário para ATIVO")
                        self.atualizar_status_usuario(request.user)
                    else:
                        logger.info(f"[Middleware] Usuário não tem status NOVO, não é necessário atualizar")
                else:
                    logger.warning(f"[Middleware] Usuário não possui atributo status_usuario")
            else:
                logger.info(f"[Middleware] Usuário não autenticado ou é AnonymousUser: {request.user}")
        else:
            logger.info(f"[Middleware] Requisição de visualização, ignorando: {request.method}")
        
        return response
    
    def atualizar_status_usuario(self, usuario):
        """
        Atualiza o status do usuário para ATIVO e salva no banco de dados.
        """
        try:
            # Registrar status anterior
            status_anterior = usuario.status_usuario
            
            # Atualizar status
            usuario.status_usuario = 'ATIVO'
            usuario.save(update_fields=['status_usuario'])
            
            logger.info(f"[Middleware] Status do usuário atualizado com sucesso: {status_anterior} -> ATIVO")
        except Exception as e:
            logger.error(f"[Middleware] Erro ao atualizar status do usuário: {e}")
            
    

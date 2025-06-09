# solicitacoes_app/permissions.py

from rest_framework import permissions
from .models import Mandato # Assuming Mandato model is in the same app

# --- Funções Auxiliares --- 
def _is_in_group(user, group_name):
    """ Verifica se um usuário pertence a um grupo específico. """
    if user and user.is_authenticated:
        # Use __iexact for case-insensitive matching if group names might vary in case
        return user.groups.filter(name__iexact=group_name).exists()
    return False

def _get_aluno_from_solicitacao(obj):
    """ Helper para obter o objeto Aluno de uma Solicitacao ou Form específico. """
    if hasattr(obj, 'aluno'): # Caso seja o modelo Solicitacao
        return obj.aluno
    # Adicione aqui outras lógicas se diferentes forms guardam o aluno de outra forma
    # Ex: if hasattr(obj, 'form_trancamento') and hasattr(obj.form_trancamento, 'aluno'):
    #         return obj.form_trancamento.aluno
    return None

# --- Classes de Permissão por Grupo --- 
class IsCRE(permissions.BasePermission):
    message = 'Apenas usuários do grupo CRE podem realizar esta ação.'
    def has_permission(self, request, view):
        return _is_in_group(request.user, 'cre')

class IsCoordenador(permissions.BasePermission):
    message = 'Apenas usuários do grupo Coordenador podem realizar esta ação.'
    def has_permission(self, request, view):
        return _is_in_group(request.user, 'coordenador')

class IsAluno(permissions.BasePermission):
    message = 'Apenas usuários do grupo Aluno podem realizar esta ação.'
    def has_permission(self, request, view):
        return _is_in_group(request.user, 'aluno')

class IsResponsavel(permissions.BasePermission):
    message = 'Apenas usuários do grupo Responsavel podem realizar esta ação.'
    def has_permission(self, request, view):
        return _is_in_group(request.user, 'responsavel')

class IsExterno(permissions.BasePermission):
    message = 'Apenas usuários do grupo Externo podem realizar esta ação.'
    def has_permission(self, request, view):
        return _is_in_group(request.user, 'externo')

# --- Classes de Permissão Combinadas e por Objeto/Ação --- 

class IsAuthenticated(permissions.BasePermission):
    """ Permite acesso apenas a usuários autenticados. """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsOwnerOrCRE(permissions.BasePermission):
    """
    Permissão a nível de objeto para permitir acesso apenas ao Aluno dono ou ao CRE.
    """
    message = 'Você não tem permissão para acessar ou modificar esta solicitação.'
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if _is_in_group(request.user, 'cre'):
            return True
        
        aluno_obj = _get_aluno_from_solicitacao(obj)
        # Verifica se o usuário logado é o usuário associado ao Aluno da solicitação
        return aluno_obj and hasattr(aluno_obj, 'usuario') and aluno_obj.usuario == request.user

class IsResponsavelDoAlunoOrCRE(permissions.BasePermission):
    """
    Permissão a nível de objeto para permitir acesso ao Responsável do Aluno ou ao CRE.
    """
    message = 'Você não tem permissão para acessar esta solicitação como responsável.'
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if _is_in_group(request.user, 'cre'):
            return True
        if _is_in_group(request.user, 'responsavel'):
            aluno_obj = _get_aluno_from_solicitacao(obj)
            # Verifica se o usuário logado (responsável) está ligado ao aluno da solicitação
            try:
                # Acessa o objeto Responsavel ligado ao usuario e compara o aluno
                return hasattr(request.user, 'responsavel') and request.user.responsavel.aluno == aluno_obj
            except AttributeError: # Caso o user não tenha o related 'responsavel'
                return False
        return False

class IsCoordenadorDoCursoOrCRE(permissions.BasePermission):
    """
    Permissão a nível de objeto para permitir acesso ao Coordenador do Curso do Aluno ou ao CRE.
    Assume que Aluno tem um campo 'curso'.
    """
    message = 'Você não tem permissão para acessar solicitações deste curso como coordenador.'
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if _is_in_group(request.user, 'cre'):
            return True
        if _is_in_group(request.user, 'coordenador'):
            aluno_obj = _get_aluno_from_solicitacao(obj)
            if not aluno_obj or not hasattr(aluno_obj, 'curso') or not aluno_obj.curso:
                return False # Não é possível verificar o curso
            
            curso_do_aluno = aluno_obj.curso
            # Verifica se existe um Mandato ativo para o usuário logado e o curso do aluno
            return Mandato.objects.filter(
                usuario=request.user, 
                curso=curso_do_aluno, 
                data_fim__isnull=True # Considera apenas mandatos ativos
            ).exists()
        return False

class CanSubmitDesistenciaVaga(permissions.BasePermission):
    """
    Permite criar Desistência de Vaga se for Aluno, Externo ou Responsável.
    """
    message = 'Apenas Alunos, Responsáveis ou usuários Externos podem criar esta solicitação.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
             # Se usuários não logados (externos sem login?) puderem criar, ajuste aqui.
             # Por segurança, vamos exigir autenticação por padrão.
             # Se 'externo' significa não logado, precisaria de AllowAny e validação na view.
             # Assumindo que 'externo' é um grupo para usuários logados:
            return False 
        return (
            _is_in_group(request.user, 'aluno') or 
            _is_in_group(request.user, 'externo') or 
            _is_in_group(request.user, 'responsavel')
        )

# --- Permissões Compostas (Exemplos) --- 

class CanViewSolicitacaoDetail(permissions.BasePermission):
    """
    Permite visualizar detalhes da solicitação se for:
    - CRE
    - Aluno dono
    - Responsável do Aluno
    - Coordenador do Curso do Aluno
    """
    def has_object_permission(self, request, view, obj):
        return (
            IsCRE().has_permission(request, view) or
            IsOwnerOrCRE().has_object_permission(request, view, obj) or 
            IsResponsavelDoAlunoOrCRE().has_object_permission(request, view, obj) or
            IsCoordenadorDoCursoOrCRE().has_object_permission(request, view, obj)
        )

class CanListOwnSolicitacoes(permissions.BasePermission):
    """
    Permite listar solicitações se for Aluno, Responsável ou Externo.
    (A view precisará filtrar para mostrar apenas as próprias/do dependente).
    """
    message = 'Apenas Alunos, Responsáveis ou usuários Externos podem listar suas próprias solicitações.'
    def has_permission(self, request, view):
         if not request.user or not request.user.is_authenticated:
            return False
         # Adicionado 'externo' à verificação
         return (
             _is_in_group(request.user, 'aluno') or 
             _is_in_group(request.user, 'responsavel') or 
             _is_in_group(request.user, 'externo')
         )

class CanListCoordenadorSolicitacoes(permissions.BasePermission):
    """
    Permite listar solicitações se for Coordenador.
    (A view precisará filtrar para mostrar apenas as do(s) seu(s) curso(s)).
    """
    def has_permission(self, request, view):
         if not request.user or not request.user.is_authenticated:
            return False
         return _is_in_group(request.user, 'coordenador')

# CRE pode listar todas (usar IsCRE na view)

# --- Permissões para Formulários Específicos ---

class CanSubmitDispensaEdFisica(permissions.BasePermission):
    """
    Permite criar Dispensa de Educação Física se for Aluno, Externo ou Responsável.
    """
    message = 'Apenas Alunos, Responsáveis ou usuários Externos podem criar esta solicitação.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False 
        return (
            _is_in_group(request.user, 'aluno') or 
            _is_in_group(request.user, 'externo') or 
            _is_in_group(request.user, 'responsavel')
        )

class CanSubmitEntregaAtivCompl(permissions.BasePermission):
    """
    Permite criar Entrega de Atividades Complementares se for Aluno ou Responsável.
    """
    message = 'Apenas Alunos ou Responsáveis podem criar esta solicitação.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False 
        return (
            _is_in_group(request.user, 'aluno') or 
            _is_in_group(request.user, 'responsavel')
        )

class CanSubmitTrancDisciplina(permissions.BasePermission):
    """
    Permite criar Trancamento de Disciplina se for Aluno ou Responsável.
    """
    message = 'Apenas Alunos ou Responsáveis podem criar esta solicitação.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False 
        return (
            _is_in_group(request.user, 'aluno') or 
            _is_in_group(request.user, 'responsavel')
        )

class CanSubmitTrancMatricula(permissions.BasePermission):
    """
    Permite criar Trancamento de Matrícula se for Aluno ou Responsável.
    """
    message = 'Apenas Alunos ou Responsáveis podem criar esta solicitação.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False 
        return (
            _is_in_group(request.user, 'aluno') or 
            _is_in_group(request.user, 'responsavel')
        )

class CanSubmitExercicioDomiciliar(permissions.BasePermission):
    """
    Permite criar Exercício Domiciliar se for Aluno ou Responsável.
    """
    message = 'Apenas Alunos ou Responsáveis podem criar esta solicitação.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False 
        return (
            _is_in_group(request.user, 'aluno') or 
            _is_in_group(request.user, 'responsavel')
        )

class CanManageMotivos(permissions.BasePermission):
    """
    Permite gerenciar (criar, editar, excluir) motivos se for CRE ou Coordenador.
    """
    message = 'Apenas CRE ou Coordenadores podem gerenciar motivos.'
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False 
        return (
            _is_in_group(request.user, 'cre') or 
            _is_in_group(request.user, 'coordenador')
        )



from rest_framework import generics
from ..models import Solicitacao 
from ..serializers.solicitacao_serializer import SolicitacaoSerializer
from ..permissoes import CanListOwnSolicitacoes, _is_in_group 

class ListarMinhasSolicitacoesView(generics.ListAPIView):
    """
    Lista as solicitações pertencentes ao usuário logado (Aluno, Responsável ou Externo).
    """
    serializer_class = SolicitacaoSerializer
    permission_classes = [CanListOwnSolicitacoes]

    def get_queryset(self):
        """
        Filtra o queryset para retornar apenas as solicitações relevantes para o usuário logado.
        """
        user = self.request.user
        
        if _is_in_group(user, 'aluno'):
            return Solicitacao.objects.filter(aluno__usuario=user)
        
        elif _is_in_group(user, 'responsavel'):
            try:
                aluno_dependente = user.responsavel.aluno 
                return Solicitacao.objects.filter(aluno=aluno_dependente)
            except AttributeError: 
                return Solicitacao.objects.none()
                
        elif _is_in_group(user, 'externo'):
            return Solicitacao.objects.filter(aluno__usuario=user)
            
        return Solicitacao.objects.none() 


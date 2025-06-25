from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from ..serializers.solicitacao_serializer import SolicitacaoListSerializer 
# from ..services import get_todas_solicitacoes, get_solicitacoes_por_aluno

from rest_framework.permissions import IsAuthenticated
from ..permissoes import IsCRE
from ..models import Aluno 


# class SolicitacaoListCreate(generics.ListCreateAPIView):
#     queryset = Solicitacao.objects.all()
#     serializer_class = SolicitacaoSerializer
    
#     def perform_create(self, serializer):
#         # Verifica disponibilidade antes de criar
#         nome_formulario = serializer.validated_data.get('nome_formulario')
#         if nome_formulario:
#             from ..models import Disponibilidade
#             try:
#                 disp = Disponibilidade.objects.get(
#                     formulario=nome_formulario,
#                     ativo=True
#                 )
#                 hoje = timezone.now().date()
#                 if not disp.sempre_disponivel and (hoje < disp.data_inicio or hoje > disp.data_fim):
#                     raise PermissionDenied("Este formulário não está disponível no momento.")
#             except Disponibilidade.DoesNotExist:
#                 pass
#         serializer.save()

# class SolicitacaoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Solicitacao.objects.all()
#     serializer_class = SolicitacaoSerializer
#     lookup_field = 'id'
#     #permission_classes = [IsCRE]
#     permission_classes = [CanViewSolicitacaoDetail] 
   
class SolicitacaoListAllView(APIView):
    permission_classes = [IsAuthenticated, IsCRE]

    def get(self, request, *args, **kwargs):
        # todas_as_solicitacoes = get_todas_solicitacoes()
        
        serializer = SolicitacaoListSerializer(todas_as_solicitacoes, many=True)
        
        return Response(serializer.data) 
    
class MinhasSolicitacoesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            aluno = Aluno.objects.get(usuario=request.user)
        except Aluno.DoesNotExist:
            return Response({"detail": "Perfil de aluno não encontrado."}, status=404)

        # minhas_solicitacoes = get_solicitacoes_por_aluno(aluno)
        
        serializer = SolicitacaoListSerializer(minhas_solicitacoes, many=True)
        return Response(serializer.data)
    



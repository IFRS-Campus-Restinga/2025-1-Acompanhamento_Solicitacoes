from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from ..serializers.anexo_serializer import AnexoSerializer
from ..models.anexo import Anexo
from rest_framework.permissions import IsAuthenticated
from ..permissoes import IsCREForManagement, IsOwnerOrCRE, CanViewSolicitacaoDetail

class AnexoViewGetOrCreate(ListCreateAPIView):
    serializer_class = AnexoSerializer
    queryset = Anexo.objects.all()
    permission_classes = [IsAuthenticated] # Permissão base para todos autenticados

    def get_queryset(self):
        # CRE pode listar todos os anexos
        if IsCREForManagement().has_permission(self.request, self):
            return Anexo.objects.all()
        # Outros usuários só podem listar anexos relacionados às suas solicitações
        # Isso exigiria um filtro mais complexo baseado na relação Anexo -> Solicitacao -> Aluno/Responsavel
        # Por enquanto, retorna vazio para não-CRE
        return Anexo.objects.none()

    def perform_create(self, serializer):
        # Ao criar, o anexo deve ser associado a uma solicitação existente
        # A permissão para criar deve ser verificada no contexto da solicitação
        # Por exemplo, se o usuário tem permissão para criar/editar a solicitação à qual o anexo pertence
        # Esta lógica pode ser mais complexa e depender do modelo de Anexo e sua relação com as solicitações
        serializer.save()

class AnexoViewUpdateOrDelete(RetrieveUpdateDestroyAPIView):
    serializer_class = AnexoSerializer
    queryset = Anexo.objects.all()
    permission_classes = [IsAuthenticated, IsCREForManagement | IsOwnerOrCRE] # CRE ou o dono do anexo/solicitação
    
class AnexoGetFormDispensa(ListAPIView):
    serializer_class = AnexoSerializer
    queryset = Anexo.objects.all()
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail] # Permissão para ver o formulário de dispensa
    
    def get_queryset(self):
        # A permissão CanViewSolicitacaoDetail deve ser aplicada ao objeto do formulário de dispensa
        # e não diretamente ao anexo. Aqui, estamos apenas filtrando os anexos.
        # A segurança de acesso ao formulário em si é tratada na view do formulário.
        return Anexo.objects.filter(form_dispensa_ed_fisica_id=self.kwargs["pk"])



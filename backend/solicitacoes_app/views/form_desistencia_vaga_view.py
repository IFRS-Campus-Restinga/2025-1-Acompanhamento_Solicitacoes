from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models.forms.form_desistencia_vaga import FormDesistenciaVaga
from ..serializers.form_desistencia_vaga_serializer import FormDesistenciaVagaSerializer
from ..permissoes import CanSubmitDesistenciaVaga, CanViewSolicitacaoDetail, CanEditOrDeleteSolicitacao, IsCRE


class FormDesistenciaVagaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de desistência de vaga.
    """
    queryset = FormDesistenciaVaga.objects.all()
    serializer_class = FormDesistenciaVagaSerializer
    permission_classes = [IsAuthenticated, CanSubmitDesistenciaVaga] # Exige autenticação e permissão específica para criar

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Associar o usuário logado ao formulário, se aplicável
            # if request.user.is_authenticated:
            #     serializer.save(solicitante=request.user)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"erro": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        # CRE pode listar todos, outros grupos só os próprios ou de dependentes
        if IsCRE().has_permission(self.request, self):
            return FormDesistenciaVaga.objects.all()
        # Implementar lógica para Aluno, Responsável, Externo listarem apenas os seus
        # Isso pode ser feito aqui ou em um serializer/permission mais complexo
        # Por simplicidade, para este exemplo, vamos retornar vazio se não for CRE
        return FormDesistenciaVaga.objects.none()

class FormDesistenciaVagaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para visualizar, atualizar e excluir um formulário de desistência de vaga específico.
    """
    queryset = FormDesistenciaVaga.objects.all()
    serializer_class = FormDesistenciaVagaSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail, CanEditOrDeleteSolicitacao] # Permissões para visualização, edição e exclusão
    lookup_field = "id"

#class FormDesistenciaVagaListCreate(generics.ListCreateAPIView):
   # queryset = FormDesistenciaVaga.objects.all()
   # serializer_class = FormDesistenciaVagaSerializer
   # permission_classes = [CanSubmitDesistenciaVaga] 
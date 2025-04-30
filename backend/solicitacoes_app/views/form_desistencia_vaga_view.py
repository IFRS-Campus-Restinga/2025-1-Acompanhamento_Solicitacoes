from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..models.forms.form_desistencia_vaga import FormDesistenciaVaga
from ..serializers.form_desistencia_vaga_serializer import FormDesistenciaVagaSerializer

class FormDesistenciaVagaListCreate(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de desistência de vaga.
    """
    queryset = FormDesistenciaVaga.objects.all()
    serializer_class = FormDesistenciaVagaSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"erro": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class FormDesistenciaVagaDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário de desistência de vaga específico.
    """
    queryset = FormDesistenciaVaga.objects.all()
    serializer_class = FormDesistenciaVagaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

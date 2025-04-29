from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..models.forms.form_exercicio_domiciliar import FormExercicioDomiciliar
from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from rest_framework.response import Response
from rest_framework import status


class FormExercicioDomiciliarListCreate(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de solicitação de exercícios domiciliares.
    """
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"erro": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class FormExercicioDomiciliarDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário de exercício domiciliar específico.
    """
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

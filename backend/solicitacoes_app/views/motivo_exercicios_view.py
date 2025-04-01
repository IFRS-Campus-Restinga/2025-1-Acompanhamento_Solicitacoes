from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_200_OK
from rest_framework.views import APIView
from ..models.motivo_exercicios import MotivoExercicios
from ..serializers.motivo_exercicios_serializer import MotivoExerciciosSerializer

class ListarMotivoExercicios(APIView):
    def get(self, request):
        serializer = MotivoExerciciosSerializer(MotivoExercicios.objects.all(), many = True, context={"request:", request})
        return Response(serializer.data, status=HTTP_200_OK)

class CadastrarMotivoExercicios(APIView):
    def post(self, request):
        serializer = MotivoExerciciosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response("Motivo de exercicios domiciliares cadastrado com sucesso!", status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
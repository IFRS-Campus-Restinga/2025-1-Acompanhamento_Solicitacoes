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

class AtualizarMotivoExercicios(APIView):
    def put(self, request, id):
        try:
            motivo_exercicios = MotivoExercicios.objects.get(id=id)
        except MotivoExercicios.DoesNotExist:
            return Response("Motivo de exercicios domiciliares não encontrado", HTTP_404_NOT_FOUND)
        
        serializer = MotivoExerciciosSerializer(motivo_exercicios, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response("Motivo de exercicios domiciliares atualizado com sucesso!", status= HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
        
class DeletarMotivoExercicios(APIView):
    def delete(self, request, id):
        try:
            motivo_exercicios = MotivoExercicios.objects.get(id=id)
            motivo_exercicios.delete()
            return Response ("Motivo de exercicios domiciliares excluído com sucesso!", status=HTTP_200_OK)
        except MotivoExercicios.DoesNotExist:
            return Response("Motivo de exercicios domiciliares não encontrado", status=HTTP_404_NOT_FOUND)
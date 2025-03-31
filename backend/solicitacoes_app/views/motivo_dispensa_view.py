from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_200_OK
from rest_framework.views import APIView
from ..models.motivo_dispensa import MotivoDispensa
from ..serializers.motivo_dispensa_serializer import MotivoDispensaSerializer

class ListarMotivoDispensa(APIView): 
    def get(self, request):
        serializer = MotivoDispensaSerializer(MotivoDispensa.objects.all(), many=True, context={"request:", request})
        return Response(serializer.data, status=HTTP_200_OK)

class CadastrarMotivoDispensa(APIView):  
    def post(self, request):
        serializer = MotivoDispensaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response("Motivo de dispensa cadastrado com sucesso!", status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class AtualizarMotivoDispensa(APIView):
    def put(self, request, id):
        try:
            motivo_dispensa = MotivoDispensa.objects.get(id=id)
        except MotivoDispensa.DoesNotExist:
            return Response("Motivo de dispensa não encontrado", HTTP_404_NOT_FOUND)
    
        serializer = MotivoDispensaSerializer(motivo_dispensa, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response("Motivo de dispensa atualizado com sucesso!", status=HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
    
class DeletarMotivoDispensa(APIView):
    def delete(self, request, id):
        try:
            motivo_dispensa = MotivoDispensa.objects.get(id=id)
            motivo_dispensa.delete()
            return Response("Motivo de dispensa excluído com sucesso", status=HTTP_200_OK)
        except MotivoDispensa.DoesNotExist:
            return Response("Motivo de dispensa não encontrado", status=HTTP_404_NOT_FOUND)
        

        
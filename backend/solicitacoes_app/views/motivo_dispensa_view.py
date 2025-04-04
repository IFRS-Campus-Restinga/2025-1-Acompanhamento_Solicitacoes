from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_200_OK
from rest_framework import generics
from ..models.motivo_dispensa import MotivoDispensa
from ..serializers.motivo_dispensa_serializer import MotivoDispensaSerializer

class MotivoDispensaListService(generics.ListCreateAPIView): 
    """
    Service que retorna todos os motivos cadastrados, além de permitir cadastrar um novo
    """
    serializer_class = MotivoDispensaSerializer
    queryset = MotivoDispensa.objects.all()
    def get(self, request):
        serializer = MotivoDispensaSerializer(
            MotivoDispensa.objects.all(), 
            many=True, 
            context={"request:",
                      request})
        return Response(serializer.data, status=HTTP_200_OK)
    
    def post(self, request):
        serializer = MotivoDispensaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Motivo de dispensa cadastrado com sucesso!"}, status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class MotivoDispensaService(generics.UpdateAPIView, generics.DestroyAPIView):  
    """
    Service que realiza as operações de Deletar ou atualizar um motivo de dispensa
    """
    serializer_class = MotivoDispensaSerializer
    queryset = MotivoDispensa.objects.all()
    
    def put(self, request, id):
        try:
            motivo_dispensa = MotivoDispensa.objects.get(id=id)
        except MotivoDispensa.DoesNotExist:
            return Response({"message":"Motivo de dispensa não encontrado"}, HTTP_404_NOT_FOUND)
    
        serializer = MotivoDispensaSerializer(motivo_dispensa, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Motivo de dispensa atualizado com sucesso!"}, status=HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            motivo_dispensa = MotivoDispensa.objects.get(id=id)
            motivo_dispensa.delete()
            return Response({"message":"Motivo de dispensa excluído com sucesso"}, status=HTTP_200_OK)
        except MotivoDispensa.DoesNotExist:
            return Response({"message": "Motivo de dispensa não encontrado"}, status=HTTP_404_NOT_FOUND)
        

        
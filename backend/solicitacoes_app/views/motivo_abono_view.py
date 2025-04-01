from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import MotivoAbono
from rest_framework import status
from rest_framework.views import APIView
from ..serializers.motivo_abono_serializer import MotivoAbonoSerializer


class ListarMotivoAbono(APIView):
    def get(self, request):
        motivos_abono = MotivoAbono.objects.all()
        serializer = MotivoAbonoSerializer(motivos_abono, many=True, context={"request:", request})
        return Response(serializer.data)



class CadastrarMotivoAbono(APIView): 
    def post(self, request):
        serializer = MotivoAbonoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  



class DetalharMotivoAbono(APIView):
    def get(self, request, id):
        motivo_abono = MotivoAbono.objects.get(id=id)
        serializer = MotivoAbonoSerializer(motivo_abono)
        return Response(serializer.data)



class AtualizarMotivoAbono(APIView):
    def put(self, request, id):
        motivo_abono = MotivoAbono.objects.get(id=id)
        serializer = MotivoAbonoSerializer(motivo_abono, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeletarMotivoAbono(APIView):
    def delete(self, request, id):
        try:
            motivo_abono = MotivoAbono.objects.get(id=id)
            motivo_abono.delete()
            return Response({'message': 'Motivo de Abono excluído com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
        except MotivoAbono.DoesNotExist:
            return Response("Motivo de Abono não encontrado", status=status.HTTP_404_NOT_FOUND)
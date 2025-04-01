from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import MotivoAbono
from rest_framework import status
from rest_framework.views import APIView
from ..serializers.motivo_abono_serializer import MotivoAbonoSerializer


class ListarMotivoAbono(APIView):
    def get(request):
        motivos_abono = MotivoAbono.objects.all()
        serializer = MotivoAbonoSerializer(motivos_abono, many=True)
        return Response(serializer.data)



class CadastrarMotivoAbono(APIView): 
    def post(request):
        serializer = MotivoAbonoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  



class DetalharMotivoAbono(APIView):
    def get(request, pk):
        motivo_abono = get_object_or_404(MotivoAbono, pk=pk)
        serializer = MotivoAbonoSerializer(motivo_abono)
        return Response(serializer.data)



class AtualizarMotivoAbono(APIView):
    def atualizar_motivo_abono(request, pk):
        motivo_abono = get_object_or_404(MotivoAbono, pk=pk)
        serializer = MotivoAbonoSerializer(motivo_abono, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeletarMotivoAbono(APIView):
    def delete(request, pk):
        try:
            motivo_abono = get_object_or_404(MotivoAbono, pk=pk)
            motivo_abono.delete()
            return Response({'message': 'Motivo de Abono excluído com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
        except MotivoAbono.DoesNotExist:
            return Response("Motivo de Abono não encontrado", status=status.HTTP_404_NOT_FOUND)
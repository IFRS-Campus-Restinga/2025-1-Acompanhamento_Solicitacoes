from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import MotivoAbono
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from ..serializers.motivo_abono_serializer import MotivoAbonoSerializer


@api_view(['GET'])
def listar_motivos_abono(request):
    motivos_abono = MotivoAbono.objects.all()
    serializer = MotivoAbonoSerializer(motivos_abono, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes({})
def criar_motivo_abono(request):
    serializer = MotivoAbonoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  


@api_view(['GET'])
def detalhar_motivo_abono(request, pk):
    motivo_abono = get_object_or_404(MotivoAbono, pk=pk)
    serializer = MotivoAbonoSerializer(motivo_abono)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes({})
def atualizar_motivo_abono(request, pk):
    motivo_abono = get_object_or_404(MotivoAbono, pk=pk)
    serializer = MotivoAbonoSerializer(motivo_abono, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes({})
def deletar_motivo_abono(request, pk):
    motivo_abono = get_object_or_404(MotivoAbono, pk=pk)
    motivo_abono.delete()
    return Response({'message': 'Motivo de Abono excluído com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
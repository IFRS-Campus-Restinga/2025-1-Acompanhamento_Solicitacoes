from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from ..models import Ppc
from ..serializers.ppc_serializer import PpcSerializer


@api_view(['POST'])
@permission_classes([]) 
def cadastrar_ppc(request):
    serializer = PpcSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'PPC cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def listar_ppcs(request):
    ppcs = Ppc.objects.all()
    serializer = PpcSerializer(ppcs, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def obter_ppc(request, ppc_codigo):
    try:
        ppc = Ppc.objects.get(codigo=ppc_codigo)
        serializer = PpcSerializer(ppc, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Ppc.DoesNotExist:
        return Response({'mensagem': 'PPC não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([])  
def atualizar_ppc(request, ppc_codigo):
    try:
        ppc = Ppc.objects.get(codigo=ppc_codigo)
    except Ppc.DoesNotExist:
        return Response({'message': 'PPC não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PpcSerializer(ppc, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'PPC atualizado com sucesso!'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([]) 
def deletar_ppc(request, ppc_codigo):
    try:
        ppc = Ppc.objects.get(codigo=ppc_codigo)
        ppc.delete()
        return Response({'message': 'PPC deletado com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
    except Ppc.DoesNotExist:
        return Response({'message': 'PPC não encontrado'}, status=status.HTTP_404_NOT_FOUND)

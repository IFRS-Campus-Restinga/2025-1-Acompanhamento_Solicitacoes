from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group
from ..serializers.grupo_serializer import GrupoSerializer

@api_view(['POST'])
@permission_classes([]) 
def cadastrar_grupo(request):
    serializer = GrupoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Grupo cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def listar_grupos(request):
    grupos = Group.objects.all()
    serializer = GrupoSerializer(grupos, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def obter_grupo(request, grupo_id):
    try:
        grupo = Group.objects.get(id=grupo_id)
        serializer = GrupoSerializer(grupo, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Group.DoesNotExist:
        return Response({'mensagem': 'Grupo não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([])  
def atualizar_grupo(request, grupo_id):
    try:
        grupo = Group.objects.get(id=grupo_id)
    except Group.DoesNotExist:
        return Response({'message': 'Grupo não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = GrupoSerializer(grupo, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Grupo atualizado com sucesso!'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([]) 
def deletar_grupo(request, grupo_id):
    try:
        grupo = Group.objects.get(id=grupo_id)
        grupo.delete()
        return Response({'message': 'Grupo deletado com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
    except Group.DoesNotExist:
        return Response({'message': 'Grupo não encontrado'}, status=status.HTTP_404_NOT_FOUND)
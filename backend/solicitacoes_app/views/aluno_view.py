from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from ..models import Aluno
from ..serializers.aluno_serializer import AlunoSerializer


@api_view(['POST'])
@permission_classes([]) 
def cadastrar_aluno(request):
    serializer = AlunoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Aluno cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def listar_alunos(request):
    alunos = Aluno.objects.all()
    serializer = AlunoSerializer(alunos, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def obter_aluno(request, aluno_id):
    try:
        aluno = Aluno.objects.get(id=aluno_id)
        serializer = AlunoSerializer(aluno, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Aluno.DoesNotExist:
        return Response({'mensagem': 'Aluno não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([])  
def atualizar_aluno(request, aluno_id):
    try:
        aluno = Aluno.objects.get(id=aluno_id)
    except Aluno.DoesNotExist:
        return Response({'message': 'Aluno não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AlunoSerializer(aluno, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Aluno atualizado com sucesso!'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([]) 
def deletar_aluno(request, aluno_id):
    try:
        aluno = Aluno.objects.get(id=aluno_id)
        aluno.delete()
        return Response({'message': 'Aluno deletado com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
    except Aluno.DoesNotExist:
        return Response({'message': 'Aluno não encontrado'}, status=status.HTTP_404_NOT_FOUND)

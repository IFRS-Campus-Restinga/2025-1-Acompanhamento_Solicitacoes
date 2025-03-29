from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from ..models import Curso, Ppc
from ..serializers.curso_serializer import CursoSerializer


@api_view(['POST'])
@permission_classes([]) 
def cadastrar_curso(request):
    data = request.data
    ppcs = data.pop('ppcs', [])  

    serializer_curso = CursoSerializer(data=data)

    if not serializer_curso.is_valid():
        return Response(serializer_curso.errors, status=status.HTTP_400_BAD_REQUEST)

    curso = serializer_curso.save()  

    for ppc_codigo in ppcs:
        try:
            ppc = Ppc.objects.get(codigo=ppc_codigo)
            ppc.curso = curso
            ppc.save()
        except Ppc.DoesNotExist:
            return Response({'message': f'PPC {ppc_codigo} não encontrado'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Curso cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def listar_cursos(request):
    cursos = Curso.objects.all()
    serializer = CursoSerializer(cursos, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def obter_curso(request, curso_codigo):
    try:
        curso = Curso.objects.get(codigo=curso_codigo)
        serializer = CursoSerializer(curso, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Curso.DoesNotExist:
        return Response({'mensagem': 'Curso não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([])  
def atualizar_curso(request, curso_codigo):
    try:
        curso = Curso.objects.get(codigo=curso_codigo)
    except Curso.DoesNotExist:
        return Response({'message': 'Curso não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CursoSerializer(curso, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Curso atualizado com sucesso!'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([]) 
def deletar_curso(request, curso_codigo):
    try:
        curso = Curso.objects.get(codigo=curso_codigo)
        curso.delete()
        return Response({'message': 'Curso deletado com sucesso!'}, status=status.HTTP_204_NO_CONTENT)
    except Curso.DoesNotExist:
        return Response({'message': 'Curso não encontrado'}, status=status.HTTP_404_NOT_FOUND)

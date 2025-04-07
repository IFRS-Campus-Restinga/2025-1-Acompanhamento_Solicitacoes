from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Disciplina
from ..serializers.disciplina_serializer import DisciplinaSerializer

@api_view(['GET', 'POST'])
def disciplina_list_create(request):
    if request.method == 'GET':
        disciplinas = Disciplina.objects.all()
        serializer = DisciplinaSerializer(disciplinas, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = DisciplinaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def disciplina_detail(request, pk):
    try:
        disciplina = Disciplina.objects.get(pk=pk)
    except Disciplina.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DisciplinaSerializer(disciplina)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DisciplinaSerializer(disciplina, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        disciplina.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
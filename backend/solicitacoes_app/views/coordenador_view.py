from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers.coordenador_serializer import CoordenadorSerializer
from solicitacoes_app.models import Coordenador


class CoordenadorListService(APIView):

    """
    Service para criar e listar dados dos coordenadores.
    """

    queryset = Coordenador.objects.all()
    serializer_class = CoordenadorSerializer

    def get(self, request, format=None):

        """
        Retorna a lista de coordenadores.
        """

        coordenadores = Coordenador.objects.all()
        context = {
            'request': request,
            'format': format
        }
        serializer = CoordenadorSerializer(coordenadores, many=True, context=context)
        return Response(serializer.data)
    
    def post(self, request, format=None):

        """
        Cria um novo coordenador.
        """

        dados = request.data
        context = {
            'request': request,
            'format': format
        }
        serializer = CoordenadorSerializer(data=dados, context=context)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CoordenadorService(APIView):

        """
        Service para atualizar, deletar dados dos coordenadores.
        """

        def get_object (self, pk):
            try:
                return Coordenador.objects.get (pk=pk)
            except Coordenador.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        
        def get(self, request, pk, format=None):

            """
            Retorna os dados de um coordenador.
            """
            
            coordenador = self.get_object(pk)
            context = {
                'request': request,
                'format' : format,
            }
            serializer = CoordenadorSerializer(coordenador, context=context)
            return Response (serializer.data)
    
        def put(self, request, pk, format=None):

            """
            Atualiza os dados de um coordenador existente.
            """

            coordenador = self.get_object(pk)
            dados = request.data
            context = {
                'request': request,
                'format': format
            }
            serializer = CoordenadorSerializer(coordenador, data=dados, context=context)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        def delete(self, request, pk, format=None):

            """
            Deleta um coordenador .
            """

            coordenador = self.get_object(pk)
            coordenador.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    
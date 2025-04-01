from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers.cre_serializer import CRESerializer
from solicitacoes_app.models import CRE


class CREListService(APIView):

    """
    Service para criar e listar dados das CREs.
    """

    queryset = CRE.objects.all()
    serializer_class = CRESerializer

    def get(self, request, format=None):

        """
        Retorna a lista de cres.
        """

        cres = CRE.objects.all()
        context = {
            'request': request,
            'format': format
        }
        serializer = CRESerializer(cres, many=True, context=context)
        return Response(serializer.data)
    
    def post(self, request, format=None):

        """
        Cria uma nova CRE.
        """

        dados = request.data
        context = {
            'request': request,
            'format': format
        }
        serializer = CRESerializer(data=dados, context=context)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CREService(APIView):

        """
        Service para atualizar, deletar dados das cres.
        """

        def get_object (self, pk):
            try:
                return CRE.objects.get (pk=pk)
            except CRE.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        
        def get(self, request, pk, format=None):

            """
            Retorna os dados de uma CRE.
            """
            
            cre = self.get_object(pk)
            context = {
                'request': request,
                'format' : format,
            }
            serializer = CRESerializer(cre, context=context)
            return Response (serializer.data)
    
        def put(self, request, pk, format=None):

            """
            Atualiza os dados de uma cre.
            """

            cre = self.get_object(pk)
            dados = request.data
            context = {
                'request': request,
                'format': format
            }
            serializer = CRESerializer(cre, data=dados, context=context)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        def delete(self, request, pk, format=None):

            """
            Deleta uma cre.
            """

            cre = self.get_object(pk)
            cre.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
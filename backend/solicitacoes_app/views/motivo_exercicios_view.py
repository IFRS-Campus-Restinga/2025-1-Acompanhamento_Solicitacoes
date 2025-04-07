from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_200_OK

from ..models.motivo_exercicios import MotivoExercicios
from ..serializers.motivo_exercicios_serializer import MotivoExerciciosSerializer


class MotivoExerciciosListCreateView(generics.ListCreateAPIView):
    queryset = MotivoExercicios.objects.all()
    serializer_class = MotivoExerciciosSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'message': "Motivo de exercicios domiciliares cadastrado com sucesso!"}, status=HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class MotivoExerciciosRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MotivoExercicios.objects.all()
    serializer_class = MotivoExerciciosSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer= self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message':"Motivo de exercicios domiciliares atualizado com sucesso!"}, status= HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response ({'message': "Motivo de exercícios domiciliares excluído com sucesso!"}, status=HTTP_200_OK)



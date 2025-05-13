from rest_framework.generics import ListAPIView
from ..models import Usuario
from ..serializers.usuario_serializer import UsuarioSerializer# O seu UsuarioSerializer existente
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import Turma
from ..serializers.disciplina_serializer import DisciplinaSerializer # O novo DisciplinaSerializer
from django.shortcuts import get_object_or_404

class UsuarioPorEmailView(ListAPIView):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        email = self.request.query_params.get('email', None)
        if email is not None:
            return Usuario.objects.filter(email__iexact=email)
        return Usuario.objects.none() # Retorna vazio se não houver e-mail
        


class DisciplinasPorTurmaView(APIView):
    def get(self, request, turma_id, format=None):
        turma = get_object_or_404(Turma, pk=turma_id)
        disciplinas = turma.disciplinas.all()
        serializer = DisciplinaSerializer(disciplinas, many=True)
        return Response(serializer.data)

 
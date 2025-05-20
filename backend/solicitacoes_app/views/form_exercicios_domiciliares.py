
from rest_framework import viewsets, status, generics

from rest_framework import viewsets, generics
from rest_framework.response import Response
from ..models import FormExercicioDomiciliar, Ppc, Disciplina, Usuario

from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from ..serializers.disciplina_serializer import DisciplinaSerializer 
from ..serializers.usuario_serializer import UsuarioSerializer

class UsuarioPorEmailView(generics.ListAPIView):
    """Endpoint para buscar usuário por email"""
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        email = self.request.query_params.get('email')
        return Usuario.objects.filter(email__iexact=email) if email else Usuario.objects.none()

class DisciplinasPorPPCView(generics.ListAPIView):
    """Endpoint para listar disciplinas de um PPC"""
    serializer_class = DisciplinaSerializer
    
    def get_queryset(self):
        ppc_codigo = self.kwargs['ppc_codigo']
        return Disciplina.objects.filter(ppc__codigo=ppc_codigo).select_related('ppc')

class FormExercicioDomiciliarViewSet(viewsets.ModelViewSet):
    """Endpoint CRUD completo para exercícios domiciliares"""
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer

    def create(self, request, *args, **kwargs):
        # Sua implementação personalizada de create aqui
        pass
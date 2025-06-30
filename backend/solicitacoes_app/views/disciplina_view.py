from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from ..serializers.disciplina_serializer import *
from ..models import Disciplina
from ..permissoes import IsCREForManagement, IsCoordenador


class DisciplinaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar disciplinas.
    """
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode criar/listar todas as disciplinas

    def get_queryset(self):
        # CRE pode listar todas, Coordenador pode listar as do seu curso
        if IsCREForManagement().has_permission(self.request, self):
            return Disciplina.objects.all()
        elif IsCoordenador().has_permission(self.request, self):
            # Implementar lógica para coordenador listar disciplinas do seu curso
            # Isso exigiria acesso ao modelo Curso e Mandato
            # Por enquanto, retorna vazio para coordenador até que a lógica seja implementada
            return Disciplina.objects.none()
        return Disciplina.objects.none() # Ninguém mais pode listar


class DisciplinaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar e deletar uma disciplina específica.
    """
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [IsAuthenticated, IsCREForManagement] # Apenas CRE pode gerenciar disciplinas
    lookup_field = 'codigo'  # Se você usar o campo 'codigo' para recuperar a disciplina
    
    
########## MUDANDO FUNCOES DE VIEW PARA CLASSES:
class DisciplinasPorCursoView(generics.ListAPIView):
    serializer_class = DisciplinaSerializer
    permission_classes = [IsAuthenticated] # Todos autenticados podem ver disciplinas por curso
    def get_queryset(self):
        curso_codigo = self.kwargs.get('curso_codigo')
        
        queryset = Disciplina.objects.filter(ppc__curso__codigo=curso_codigo).distinct()
        return queryset

class DisciplinasPorPpcPeriodoView(generics.ListAPIView):
    serializer_class = DisciplinaListComPeriodoSerializer
    permission_classes = [IsAuthenticated] # Todos autenticados podem ver disciplinas por PPC e período

    def get_queryset(self):
        ppc_codigo = self.request.query_params.get('ppc_codigo')
        periodo = self.request.query_params.get('periodo')

        if not ppc_codigo or not periodo:
            return Disciplina.objects.none() # Retorna um queryset vazio

        queryset = Disciplina.objects.filter(
            ppc__codigo=ppc_codigo, 
            periodo=periodo
        ).distinct()
        
        return queryset



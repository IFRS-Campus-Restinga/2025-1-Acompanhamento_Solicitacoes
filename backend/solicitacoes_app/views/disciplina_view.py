from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.disciplina_serializer import *
from ..models import Disciplina


class DisciplinaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar disciplinas.
    """
    queryset = Disciplina.objects.all()  # Use filter caso queira aplicar algum filtro, por exemplo: .filter(ativo=True)
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        ppc_id = self.request.GET.get("ppc_id")
        if ppc_id:
            return Disciplina.objects.filter(ppc__codigo=ppc_id)  # Certifique-se que "codigo" é o campo correto
        return Disciplina.objects.all()


class DisciplinaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para recuperar, atualizar e deletar uma disciplina específica.
    """
    queryset = Disciplina.objects.all()  # Use filter caso queira aplicar algum filtro, por exemplo: .filter(ativo=True)
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'codigo'  # Se você usar o campo 'codigo' para recuperar a disciplina
    
    
########## MUDANDO FUNCOES DE VIEW PARA CLASSES:
class DisciplinasPorCursoView(generics.ListAPIView):
    serializer_class = DisciplinaSerializer
    def get_queryset(self):
        curso_codigo = self.kwargs.get('curso_codigo')
        
        queryset = Disciplina.objects.filter(ppc__curso__codigo=curso_codigo).distinct()
        return queryset

class DisciplinasPorPpcPeriodoView(generics.ListAPIView):
    serializer_class = DisciplinaListComPeriodoSerializer

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

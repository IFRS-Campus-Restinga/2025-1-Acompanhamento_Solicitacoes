from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from ..models import FormTrancDisciplina, Disciplina
from ..serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from ..permissoes import CanSubmitTrancDisciplina, CanViewSolicitacaoDetail


class FormTrancDisciplinaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de trancamento de disciplinas.
    (Versão corrigida - 21/05/2025)
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanSubmitTrancDisciplina] 


    def perform_create(self, serializer):
        # Log dos dados recebidos (para debug)
        print("🔥 Dados recebidos:", self.request.data)
        
        # Salva o formulário (a herança com Solicitacao já trata tudo)
        serializer.save()  
        
# ALTERADO: A classe agora herda de RetrieveUpdateDestroyAPIView e foi renomeada
# para refletir suas novas capacidades (Detalhar, Atualizar, Deletar).
class FormTrancDisciplinaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vê detalhes (GET), Atualiza (PUT/PATCH) e Deleta (DELETE) um formulário
    de Trancamento de Disciplina específico pelo seu ID.
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    permission_classes = [CanViewSolicitacaoDetail] 
    
    # MANTIDO: O campo de busca continua o mesmo.
    # DRF usa 'pk' por padrão, mas 'id' também funciona se seu modelo usar 'id'.
    # Usar 'pk' é uma prática mais comum.
    lookup_field = "pk" 

@api_view(['GET'])
def disciplinas_por_curso(request, curso_codigo):
    """
    Endpoint para listar disciplinas de um curso (mantido original).
    """
    try:
        disciplinas = Disciplina.objects.filter(ppc__curso__codigo=curso_codigo).distinct()
        return Response({
            "disciplinas": [
                {"codigo": d.codigo, "nome": d.nome} for d in disciplinas
            ]
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
def disciplinas_por_ppc_e_periodo(request):
    """
    Endpoint para listar disciplinas filtradas por PPC e Período.
    Ex: /api/disciplinas/?ppc_codigo=ads/101.2018&periodo=1º Semestre
    """
    ppc_codigo = request.query_params.get('ppc_codigo')
    periodo = request.query_params.get('periodo')

    if not ppc_codigo or not periodo:
        return Response(
            {"error": "Os parâmetros 'ppc_codigo' e 'periodo' são obrigatórios."}, 
            status=400
        )

    try:
        # Filtra as disciplinas pelo código do PPC E pelo período
        disciplinas = Disciplina.objects.filter(
            ppc__codigo=ppc_codigo, 
            periodo=periodo # O 'periodo' no modelo Disciplina usa as choices de PeriodoDisciplina
        ).distinct()

        # O retorno pode ser ajustado para incluir mais detalhes se necessário
        return Response({
            "disciplinas": [
                {"codigo": d.codigo, "nome": d.nome, "periodo": d.periodo} for d in disciplinas
            ]
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
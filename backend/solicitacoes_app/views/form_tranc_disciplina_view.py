from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from ..models import FormTrancDisciplina, Disciplina
from ..serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from ..permissoes import CanSubmitTrancDisciplina, CanViewSolicitacaoDetail


class FormTrancDisciplinaListCreate(generics.ListCreateAPIView):
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

class FormTrancDisciplinaDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário específico.
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanViewSolicitacaoDetail] 
    lookup_field = "id"

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
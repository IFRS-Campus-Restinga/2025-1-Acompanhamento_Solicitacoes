from rest_framework import generics
from rest_framework.permissions import AllowAny  # Importação adicionada
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
from ..models import FormTrancDisciplina, Disciplina, Ppc, Solicitacao, Aluno
from ..serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer

class FormTrancDisciplinaListCreate(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de trancamento de disciplinas.
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        print("🔥 request.data no backend:", self.request.data)
        aluno_id = self.request.data.get("aluno")

        if not aluno_id:
            raise ValueError("Campo 'aluno_id' é obrigatório para criar a solicitação.")
        
        # Obter o aluno e seu curso
        aluno = Aluno.objects.get(id=aluno_id)  # Assumindo que aluno também usa codigo
        curso_codigo = aluno.ppc.curso.codigo  # Acessa o codigo do curso via PPC

        form = serializer.save()

        Solicitacao.objects.create(
            aluno_id=aluno_id,
            content_type=ContentType.objects.get_for_model(FormTrancDisciplina),
            object_id=form.id,
            data_solicitacao=datetime.now()
        )

class FormTrancDisciplinaDetail(generics.RetrieveAPIView):
    """
    Endpoint para visualizar um formulário de trancamento de disciplinas específico.
    """
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

@api_view(['GET'])
def disciplinas_por_curso(request, curso_codigo):
    """
    Endpoint para listar disciplinas de um curso específico.
    """
    try:
        disciplinas = Disciplina.objects.filter(ppc__curso__codigo=curso_codigo).distinct()
        
        if not disciplinas:
            return Response({"disciplinas": []}, status=200)
        
        return Response({
            "disciplinas": [
                {"codigo": disciplina.codigo, "nome": disciplina.nome} for disciplina in disciplinas
            ]
        }, status=200)
    
    except Disciplina.DoesNotExist:
        return Response({"error": "Curso não encontrado ou sem disciplinas."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
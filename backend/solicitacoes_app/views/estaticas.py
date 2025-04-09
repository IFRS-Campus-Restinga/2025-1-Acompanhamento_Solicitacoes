from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def saudacao(request):
    return Response({"saudacao": "Olá Mundo"})


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'saudacao': reverse('solicitacoes_app:saudacao', request=request, format=format),
        
        'cursos': reverse('solicitacoes_app:listar_cadastrar_cursos', request=request, format=format),
        
        'ppcs': reverse('solicitacoes_app:listar_cadastrar_ppcs', request=request, format=format),

        'alunos': reverse('solicitacoes_app:aluno-list', request=request, format=format),

        'coordenadores': reverse('solicitacoes_app:coordenador-list', request=request, format=format),

        'cres': reverse('solicitacoes_app:cre-list', request=request, format=format),

        'motivo_dispensa' : reverse('solicitacoes_app:listar_motivo_dispensa', request=request, format=format),

        'disciplinas': reverse('solicitacoes_app:disciplina-list', request=request, format=format),

        'motivo_exercicios': {
            reverse('solicitacoes_app:listar_motivo_exercicios', request=request, format=format),
        },

        'motivo_abono': reverse('solicitacoes_app:motivo_abono_list', request=request, format=format),

        'turmas': reverse('solicitacoes_app:turma-list', request=request, format=format),
        
        })
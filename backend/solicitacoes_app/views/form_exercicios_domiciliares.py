
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from ..models import FormExercicioDomiciliar, Disciplina, Usuario,  PeriodoDisciplina, Curso, Ppc

from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from ..serializers.disciplina_serializer import DisciplinaSerializer 
from ..serializers.usuario_serializer import UsuarioSerializer
from ..serializers.form_buscar_info_serializer import AlunoInfoSerializer

class UsuarioPorEmailView(generics.ListAPIView):
    """Endpoint para buscar usuário por email"""
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        email = self.request.query_params.get('email')
        return Usuario.objects.filter(email__iexact=email) if email else Usuario.objects.none()
    
class DisciplinasPorCursoView(generics.ListAPIView):
    def get(self, request, curso_codigo):
        try:
            curso = Curso.objects.get(codigo=curso_codigo)
        except Curso.DoesNotExist:
            return Response({"erro": "Curso não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if curso.tipo_periodo == Curso.TipoPeriodo.SEMESTRAL:
            periodos_validos = [
                PeriodoDisciplina.PRIMEIRO_SEMESTRE,
                PeriodoDisciplina.SEGUNDO_SEMESTRE,
                PeriodoDisciplina.TERCEIRO_SEMESTRE,
                PeriodoDisciplina.QUARTO_SEMESTRE,
                PeriodoDisciplina.QUINTO_SEMESTRE,
                PeriodoDisciplina.SEXTO_SEMESTRE,
                PeriodoDisciplina.SETIMO_SEMESTRE,
                PeriodoDisciplina.OITAVO_SEMESTRE,
                PeriodoDisciplina.NONO_SEMESTRE,
                PeriodoDisciplina.DECIMO_SEMESTRE,
            ]
        else:
            periodos_validos = [
                PeriodoDisciplina.PRIMEIRO_ANO,
                PeriodoDisciplina.SEGUNDO_ANO,
                PeriodoDisciplina.TERCEIRO_ANO,
                PeriodoDisciplina.QUARTO_ANO,
            ]

        disciplinas = Disciplina.objects.filter(
            ppc__curso=curso,
            periodo__in=periodos_validos
        )
        serializer = DisciplinaSerializer(disciplinas, many=True)
        return Response(serializer.data)
    

class AlunoInfoPorEmailView(generics.RetrieveAPIView):
    """
    Endpoint para buscar informações do aluno associado ao usuário logado
    """
permission_classes = [IsAuthenticated]
serializer_class = AlunoInfoSerializer

def get_object(self):
    # Usuário logado
    usuario_logado = self.request.user
    
    # Verifica se foi passado email por query param (para compatibilidade)
    email_param = self.request.query_params.get('email')
    
    # Se foi passado email, verifica se corresponde ao usuário logado
    if email_param and email_param.lower() != usuario_logado.email.lower():
        raise PermissionDenied("Você não tem permissão para acessar dados de outro aluno")
    
    # Verifica se o usuário tem perfil de aluno
    if not hasattr(usuario_logado, 'aluno'):
        raise PermissionDenied("Usuário não possui perfil de aluno")
        
    return usuario_logado.aluno

def get(self, request, *args, **kwargs):
    try:
        return super().get(request, *args, **kwargs)
    except PermissionDenied as e:
        return Response({"erro": str(e)}, status=status.HTTP_403_FORBIDDEN)
        return Response({"erro": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def disciplinas_por_ppc(request):
    ppc_codigo = request.query_params.get('ppc_codigo')
    if not ppc_codigo:
        return Response({"erro": "Código do PPC não fornecido"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        ppc = Ppc.objects.get(codigo=ppc_codigo)
        disciplinas = Disciplina.objects.filter(ppc=ppc)
        serializer = DisciplinaSerializer(disciplinas, many=True)
        return Response(serializer.data)
    except Ppc.DoesNotExist:
        return Response({"erro": "PPC não encontrado"}, status=status.HTTP_404_NOT_FOUND)


class FormExercicioDomiciliarViewSet(viewsets.ModelViewSet):
    """Endpoint CRUD completo para exercícios domiciliares"""
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer

    def create(self, request, *args, **kwargs):
        # Sua implementação personalizada de create aqui
        pass
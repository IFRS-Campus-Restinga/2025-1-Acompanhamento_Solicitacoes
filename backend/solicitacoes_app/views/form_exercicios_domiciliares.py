
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from ..models import FormExercicioDomiciliar, Disciplina, Usuario,  PeriodoDisciplina, Curso

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
    

class AlunoInfoPorEmailView(generics.ListAPIView):
    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({"erro": "Email não fornecido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Busca o usuário pelo email
            usuario = Usuario.objects.get(email__iexact=email)
            
            # Verifica se o usuário tem um aluno associado
            if hasattr(usuario, 'aluno'):
                aluno = usuario.aluno
                
                # Serializa o aluno com informações completas
                serializer = AlunoInfoSerializer(aluno)
                return Response(serializer.data)
            else:
                return Response({"erro": "Usuário não é um aluno"}, status=status.HTTP_404_NOT_FOUND)
                
        except Usuario.DoesNotExist:
            return Response({"erro": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)


class FormExercicioDomiciliarViewSet(viewsets.ModelViewSet):
    """Endpoint CRUD completo para exercícios domiciliares"""
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer

    def create(self, request, *args, **kwargs):
        # Sua implementação personalizada de create aqui
        pass
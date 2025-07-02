from datetime import date
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from itertools import chain

from ..models.mandato import Mandato
from ..models import (
    Aluno,
    FormularioTrancamentoMatricula,
    FormTrancDisciplina,
    FormAbonoFalta,
    FormExercicioDomiciliar,
    FormDispensaEdFisica,
    FormEntregaAtivCompl
)
from ..permissoes import IsCRE, CanViewSolicitacaoDetail, CanListOwnSolicitacoes, CanListCoordenadorSolicitacoes, CanListAllSolicitacoes, _is_in_group 



from itertools import chain
from ..models import (
    Aluno
)
from ..models.aluno import Aluno
from ..models.forms import FormularioTrancamentoMatricula
from ..models.forms.form_tranc_disciplina import FormTrancDisciplina
from ..models.forms.form_abono_falta import FormAbonoFalta
from ..models.forms.form_exercicio_domiciliar import FormExercicioDomiciliar
from ..models.forms.form_dispensa_ed_fisica import FormDispensaEdFisica
from ..models.forms.form_entrega_ativ_compl import FormEntregaAtivCompl

from ..serializers.solicitacao_serializer import SolicitacaoListSerializer
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from ..serializers.form_tranc_disciplina_serializer import FormTrancDisciplinaSerializer
from ..serializers.form_abono_falta_serializer import FormAbonoFaltaSerializer
from ..serializers.form_exercicios_domiciliares import FormExercicioDomiciliarSerializer
from ..serializers.form_disp_ed_fisica_serializer import FormDispEdFisicaSerializer
from ..serializers.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer
from ..models.coordenador import Coordenador

# Lista central de todos os modelos de solicitação para facilitar a manutenção.
ALL_SOLICITACAO_MODELS = [
    FormularioTrancamentoMatricula,
    FormTrancDisciplina,
    FormAbonoFalta,
    FormExercicioDomiciliar,
    FormDispensaEdFisica,
    FormEntregaAtivCompl
]

def get_todas_solicitacoes():
    querysets = [model.objects.all() for model in ALL_SOLICITACAO_MODELS]
    lista_unificada = list(chain.from_iterable(querysets))
    lista_ordenada = sorted(lista_unificada, key=lambda s: s.data_solicitacao, reverse=True)
    return lista_ordenada

def get_solicitacoes_por_aluno(aluno_obj):
    querysets = [model.objects.filter(aluno=aluno_obj) for model in ALL_SOLICITACAO_MODELS]
    lista_unificada = list(chain.from_iterable(querysets))
    lista_ordenada = sorted(lista_unificada, key=lambda s: s.data_solicitacao, reverse=True)
    return lista_ordenada

def get_solicitacoes_por_curso(curso):
    querysets = [model.objects.filter(aluno__ppc__curso=curso) for model in ALL_SOLICITACAO_MODELS]
    lista_unificada = list(chain.from_iterable(querysets))
    lista_ordenada = sorted(lista_unificada, key=lambda s: s.data_solicitacao, reverse=True)
    return lista_ordenada


class SolicitacaoListAllView(APIView):
    permission_classes = [IsAuthenticated, IsCRE] # Apenas CRE pode listar todas as solicitações

    def get(self, request, *args, **kwargs):
        todas_as_solicitacoes = get_todas_solicitacoes()
        serializer = SolicitacaoListSerializer(todas_as_solicitacoes, many=True)
        
        return Response(serializer.data) 
    
    
class MinhasSolicitacoesListView(APIView):
    """
    (Para Aluno/Responsável) Lista as solicitações relevantes para o usuário logado.
    Esta view agora incorpora a lógica da sua antiga \'ListarMinhasSolicitacoesView\'.
    """
    permission_classes = [IsAuthenticated, CanListOwnSolicitacoes] # A permissão decide quem pode acessar

    def get(self, request, *args, **kwargs):
        user = self.request.user
        aluno_a_buscar = None
        coordenador_a_buscar = None

        # Lógica para determinar de qual aluno devemos buscar as solicitações
        if _is_in_group(user, 'aluno'):
            try:
                aluno_a_buscar = Aluno.objects.get(usuario=user)
            except Aluno.DoesNotExist:
                return Response({"detail": "Perfil de aluno não encontrado para este usuário."}, status=404)
        
        elif _is_in_group(user, 'responsavel'):
            try:
                # Supondo que o modelo do usuário responsável tenha um link para o Aluno dependente
                aluno_a_buscar = user.responsavel.aluno
            except AttributeError:
                # Caso o responsável não esteja ligado a nenhum aluno
                return Response({"detail": "Nenhum aluno dependente encontrado para este responsável."}, status=404)
            
        
        
        if aluno_a_buscar:
            solicitacoes = get_solicitacoes_por_aluno(aluno_a_buscar)
            serializer = SolicitacaoListSerializer(solicitacoes, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "Você não tem permissão para listar solicitações ou seu perfil não está associado a um aluno."}, status=403)

class SolicitacoesDoCoordenador(APIView):
    """
    Endpoint para coordenadores verem solicitações de alunos do seu curso.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if not _is_in_group(user, 'coordenador'):
            return Response({"detail": "Apenas coordenadores têm acesso a esta visualização."}, status=403)

        try:
            coordenador_obj = Coordenador.objects.get(usuario=user)
            coordenador_mandato = Mandato.objects.get(coordenador=coordenador_obj)
        except Coordenador.DoesNotExist:
            return Response({"detail": "Perfil de coordenador não encontrado."}, status=404)
        except Mandato.DoesNotExist:
            return Response({"detail": "Mandato não encontrado para este coordenador."}, status=404)

        hoje = date.today()
        if not (coordenador_mandato.inicio_mandato <= hoje <= coordenador_mandato.fim_mandato):
            return Response({"detail": "O mandato do coordenador não está ativo no momento."}, status=403)

        # Recupera as solicitações dos alunos do curso associado ao mandato
        curso = coordenador_mandato.curso
        solicitacoes = get_solicitacoes_por_curso(curso)
        serializer = SolicitacaoListSerializer(solicitacoes, many=True)
        return Response(serializer.data)

class FormTrancMatriculaDetailView(generics.RetrieveAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'

class FormTrancDisciplinaDetailView(generics.RetrieveAPIView):
    queryset = FormTrancDisciplina.objects.all()
    serializer_class = FormTrancDisciplinaSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'

class FormAbonoFaltaDetailView(generics.RetrieveAPIView):
    queryset = FormAbonoFalta.objects.all()
    serializer_class = FormAbonoFaltaSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'

class FormExercicioDomiciliarDetailView(generics.RetrieveAPIView):
    queryset = FormExercicioDomiciliar.objects.all()
    serializer_class = FormExercicioDomiciliarSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'

class FormDispEdFisicaDetailView(generics.RetrieveAPIView):
    queryset = FormDispensaEdFisica.objects.all()
    serializer_class = FormDispEdFisicaSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'
    
class FormEntregaAtivComplDetailView(generics.RetrieveAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    permission_classes = [IsAuthenticated, CanViewSolicitacaoDetail]
    lookup_field = 'pk'



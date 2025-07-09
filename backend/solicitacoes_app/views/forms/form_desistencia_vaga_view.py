# solicitacoes_app/views/forms/form_desistencia_vaga_view.py

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from ...models.forms.form_desistencia_vaga import FormDesistenciaVaga
from ...serializers.forms.form_desistencia_vaga_serializer import (
    FormDesistenciaVagaSerializer, 
    FormDesistenciaVagaListSerializer,
    FormDesistenciaVagaStatusSerializer
)
from ...permissoes import IsCRE, IsAluno, IsExterno, IsResponsavel


class FormDesistenciaVagaListCreateView(generics.ListCreateAPIView):
    """
    Endpoint para listar e criar formulários de desistência de vaga.
    
    - Alunos, Externos e Responsáveis podem criar formulários
    - CRE pode listar todos os formulários
    - Outros usuários só podem listar seus próprios formulários
    """
    parser_classes = [MultiPartParser, FormParser]  # Para upload de arquivos
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.request.method == 'GET':
            return FormDesistenciaVagaListSerializer
        return FormDesistenciaVagaSerializer
    
    def get_queryset(self):
        """
        Retorna os formulários que o usuário pode visualizar.
        """
        user = self.request.user
        user_groups = user.groups.values_list('name', flat=True)
        
        # CRE pode ver todos os formulários
        if 'cre' in user_groups:
            return FormDesistenciaVaga.objects.all().select_related(
                'curso', 'motivo_desistencia', 'aluno', 'usuario'
            )
        
        # Coordenadores podem ver formulários de seus cursos (implementar se necessário)
        if 'coordenador' in user_groups:
            # TODO: Implementar lógica para coordenador ver apenas de seus cursos
            # coordenador = user.coordenador
            # cursos_coordenador = coordenador.cursos.all()
            # return FormDesistenciaVaga.objects.filter(curso__in=cursos_coordenador)
            pass
        
        # Alunos veem apenas seus próprios formulários
        if 'aluno' in user_groups:
            try:
                aluno = user.aluno  # Assumindo relacionamento OneToOne
                return FormDesistenciaVaga.objects.filter(aluno=aluno).select_related(
                    'curso', 'motivo_desistencia'
                )
            except AttributeError:
                return FormDesistenciaVaga.objects.none()
        
        # Externos e Responsáveis veem apenas seus próprios formulários
        if 'externo' in user_groups or 'responsavel' in user_groups:
            return FormDesistenciaVaga.objects.filter(usuario=user).select_related(
                'curso', 'motivo_desistencia'
            )
        
        # Outros usuários não veem nenhum formulário
        return FormDesistenciaVaga.objects.none()
    
    def perform_create(self, serializer):
        """
        Customiza a criação do formulário.
        """
        user = self.request.user
        user_groups = user.groups.values_list('name', flat=True)
        
        # Verifica se o usuário tem permissão para criar formulários
        if not any(group in user_groups for group in ['aluno', 'externo', 'responsavel']):
            raise PermissionError("Usuário não tem permissão para criar formulários de desistência.")
        
        # Se é um aluno, tenta associar ao objeto Aluno
        if 'aluno' in user_groups:
            try:
                aluno = user.aluno  # Assumindo relacionamento OneToOne
                serializer.save(aluno=aluno, usuario=None)
            except AttributeError:
                # Se não encontrar o objeto Aluno, salva como usuário
                serializer.save(usuario=user, aluno=None)
        else:
            # Para externos e responsáveis, salva como usuário
            serializer.save(usuario=user, aluno=None)
    
    def create(self, request, *args, **kwargs):
        """
        Cria um novo formulário de desistência de vaga.
        """
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response(
                    {
                        "message": "Formulário de desistência criado com sucesso!",
                        "data": serializer.data
                    }, 
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {
                    "error": "Dados inválidos",
                    "details": serializer.errors
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return Response(
                {"error": f"Erro interno: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FormDesistenciaVagaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para visualizar, atualizar e excluir um formulário específico.
    
    - CRE pode visualizar, atualizar e excluir qualquer formulário
    - Proprietários podem visualizar seus próprios formulários
    - Apenas CRE pode atualizar/excluir formulários
    """
    serializer_class = FormDesistenciaVagaSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    
    def get_queryset(self):
        """
        Retorna os formulários que o usuário pode acessar.
        """
        user = self.request.user
        user_groups = user.groups.values_list('name', flat=True)
        
        # CRE pode acessar todos os formulários
        if 'cre' in user_groups:
            return FormDesistenciaVaga.objects.all().select_related(
                'curso', 'motivo_desistencia', 'aluno', 'usuario'
            )
        
        # Coordenadores podem acessar formulários de seus cursos
        if 'coordenador' in user_groups:
            # TODO: Implementar lógica para coordenador
            pass
        
        # Alunos podem acessar apenas seus próprios formulários
        if 'aluno' in user_groups:
            try:
                aluno = user.aluno
                return FormDesistenciaVaga.objects.filter(aluno=aluno).select_related(
                    'curso', 'motivo_desistencia'
                )
            except AttributeError:
                return FormDesistenciaVaga.objects.none()
        
        # Externos e Responsáveis podem acessar apenas seus próprios formulários
        if 'externo' in user_groups or 'responsavel' in user_groups:
            return FormDesistenciaVaga.objects.filter(usuario=user).select_related(
                'curso', 'motivo_desistencia'
            )
        
        return FormDesistenciaVaga.objects.none()
    
    def update(self, request, *args, **kwargs):
        """
        Atualiza um formulário. Apenas CRE pode atualizar.
        """
        user_groups = request.user.groups.values_list('name', flat=True)
        
        if 'cre' not in user_groups:
            return Response(
                {"error": "Apenas CRE pode atualizar formulários de desistência."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Exclui um formulário. Apenas CRE pode excluir.
        """
        user_groups = request.user.groups.values_list('name', flat=True)
        
        if 'cre' not in user_groups:
            return Response(
                {"error": "Apenas CRE pode excluir formulários de desistência."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


class FormDesistenciaVagaUpdateStatusView(generics.UpdateAPIView):
    """
    Endpoint específico para CRE atualizar apenas o status e observações.
    """
    serializer_class = FormDesistenciaVagaStatusSerializer
    permission_classes = [IsAuthenticated, IsCRE]
    lookup_field = "id"
    queryset = FormDesistenciaVaga.objects.all()
    
    def patch(self, request, *args, **kwargs):
        """
        Atualiza apenas status e observações da CRE.
        """
        instance = self.get_object()
        
        # Permite apenas atualização de status e observações
        allowed_fields = ['status', 'observacoes']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        if not update_data:
            return Response(
                {"error": "Nenhum campo válido para atualização fornecido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Status atualizado com sucesso!",
                    "data": serializer.data
                }
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FormDesistenciaVagaStatsView(generics.GenericAPIView):
    """
    Endpoint para estatísticas dos formulários de desistência (apenas CRE).
    """
    permission_classes = [IsAuthenticated, IsCRE]
    
    def get(self, request, *args, **kwargs):
        """
        Retorna estatísticas dos formulários de desistência.
        """
        from django.db.models import Count
        
        # Estatísticas gerais
        total_formularios = FormDesistenciaVaga.objects.count()
        
        # Por status
        stats_por_status = FormDesistenciaVaga.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Por tipo de curso
        stats_por_tipo_curso = FormDesistenciaVaga.objects.select_related('curso').values(
            'curso__tipo_curso'
        ).annotate(
            count=Count('id')
        ).order_by('curso__tipo_curso')
        
        # Por tipo de solicitante
        stats_alunos = FormDesistenciaVaga.objects.filter(aluno__isnull=False).count()
        stats_externos = FormDesistenciaVaga.objects.filter(
            usuario__isnull=False, 
            aluno__isnull=True
        ).count()
        
        # Por motivo
        stats_por_motivo = FormDesistenciaVaga.objects.select_related('motivo_desistencia').values(
            'motivo_desistencia__descricao'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            "total_formularios": total_formularios,
            "por_status": list(stats_por_status),
            "por_tipo_curso": list(stats_por_tipo_curso),
            "por_tipo_solicitante": {
                "alunos": stats_alunos,
                "externos": stats_externos
            },
            "por_motivo": list(stats_por_motivo)
        })


class FormDesistenciaVagaByCursoView(generics.ListAPIView):
    """
    Endpoint para listar formulários por curso (para coordenadores).
    """
    serializer_class = FormDesistenciaVagaListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Retorna formulários do curso especificado.
        """
        user = self.request.user
        user_groups = user.groups.values_list('name', flat=True)
        curso_codigo = self.kwargs.get('curso_codigo')
        
        # CRE pode ver todos os formulários de qualquer curso
        if 'cre' in user_groups:
            return FormDesistenciaVaga.objects.filter(
                curso__codigo=curso_codigo
            ).select_related('curso', 'motivo_desistencia', 'aluno', 'usuario')
        
        # Coordenadores podem ver apenas de seus cursos
        if 'coordenador' in user_groups:
            # TODO: Implementar verificação se o coordenador é responsável pelo curso
            # if user.coordenador.cursos.filter(codigo=curso_codigo).exists():
            #     return FormDesistenciaVaga.objects.filter(curso__codigo=curso_codigo)
            pass
        
        return FormDesistenciaVaga.objects.none()


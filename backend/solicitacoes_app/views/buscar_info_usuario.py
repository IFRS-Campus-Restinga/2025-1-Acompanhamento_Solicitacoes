from django.http import JsonResponse
from django.contrib.auth.models import User
from ..models.aluno import Aluno  # Importe seu model de Aluno
from django.http import JsonResponse
from ..models import Turma, Disciplina  # Importe seus models

def buscar_info_usuario(request):
    email = request.GET.get('email')
    if email:
        try:
            user = User.objects.get(email=email)
            try:
                aluno = Aluno.objects.get(user=user)
                data = {
                    'aluno_nome': f'{user.first_name} {user.last_name}',
                    'matricula': aluno.matricula,
                    # Adicione outros campos que você precisa
                }
            except Aluno.DoesNotExist:
                data = {
                    'aluno_nome': f'{user.first_name} {user.last_name}',
                    # Outras informações genéricas do usuário, se houver
                }
            return JsonResponse(data)
        except User.DoesNotExist:
            return JsonResponse({'erro': 'Usuário não encontrado'}, status=404)
    else:
        return JsonResponse({'erro': 'O parâmetro "email" é obrigatório'}, status=400)
    


def buscar_componentes_turma(request):
    turma_id = request.GET.get('turma_id')
    if turma_id:
        try:
            turma = Turma.objects.get(pk=turma_id)
            componentes = turma.disciplinas.all().values('id', 'nome') # Ajuste os campos conforme seu model
            return JsonResponse(list(componentes), safe=False)
        except Turma.DoesNotExist:
            return JsonResponse({'erro': 'Turma não encontrada'}, status=404)
    else:
        return JsonResponse({'erro': 'O parâmetro "turma_id" é obrigatório'}, status=400)
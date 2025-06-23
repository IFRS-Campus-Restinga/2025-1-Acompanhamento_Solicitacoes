from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view

User = get_user_model()

@api_view(['GET'])
def verificar_usuario(request):
    """
    Verifica se um usuário com o email fornecido existe no sistema
    e retorna seus grupos.
    """
    email = request.query_params.get('email')
    
    if not email:
        return JsonResponse({
            'error': 'Email não fornecido',
            'exists': False,
            'groups': []
        }, status=400)
    
    try:
        # Adicionar logs para depuração
        print(f"Verificando usuário com email: {email}")
        
        user = User.objects.filter(email=email).first()
        
        if user:
            # Usuário existe, retornar seus grupos
            groups = list(user.groups.values_list('name', flat=True))
            print(f"Usuário encontrado. Grupos: {groups}")
            return JsonResponse({
                'exists': True,
                'groups': groups
            })
        else:
            # Usuário não existe
            print(f"Usuário com email {email} não encontrado")
            return JsonResponse({
                'exists': False,
                'groups': []
            })
    
    except Exception as e:
        print(f"Erro ao verificar usuário: {str(e)}")
        return JsonResponse({
            'error': str(e),
            'exists': False,
            'groups': []
        }, status=500)

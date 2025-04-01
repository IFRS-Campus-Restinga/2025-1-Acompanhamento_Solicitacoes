import re
from django.contrib.auth.models import Group
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

GRUPOS = {
    "alunos": r"^[\w.-]+@aluno\.restinga\.ifrs\.edu\.br$",
    "coordenacao": r"^(coord|coordenacao)\.[a-z0-9._%+-]+@restinga\.ifrs\.edu\.br$",
    "cre": r"^cre@restinga\.ifrs\.edu\.br$",
    #"administrador": r"^[\w.-]+@restinga\.ifrs\.edu\.br$" se passar por aqui, qualquer email valido vai ser adm dai?
    #grupo de responsaveis?
}

def classificar_usuario(email):
    """Verifica a qual grupo o e-mail pertence."""
    for grupo, pattern in GRUPOS.items():
        if re.match(pattern, email):
            return grupo
    raise ValueError("Acesso negado: e-mail não pertence a nenhum grupo válido.")

class GrupoUsuarioView(APIView):
    def post(self, request):
        """Classifica o usuário em um dos grupos com base no e-mail."""
        email = request.data.get("email")

        try:
            grupo_usuario = classificar_usuario(email)
            return Response({"grupo": grupo_usuario, "message": f"Usuário classificado como {grupo_usuario}."}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)



# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        dados = {
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "cpf": usuario.cpf,
                "telefone": usuario.telefone,
                "data_nascimento": usuario.data_nascimento,
                "status_usuario": usuario.status_usuario,
            }
        }

        # Adiciona dados específicos se for aluno, coordenador ou CRE
        if hasattr(usuario, "aluno"):
            aluno = usuario.aluno
            dados["tipo"] = "aluno"
            dados["aluno"] = {
                "matricula": aluno.matricula,
                "turma": aluno.turma,
                "ano_ingresso": aluno.ano_ingresso,
            }
        elif hasattr(usuario, "coordenador"):
            dados["tipo"] = "coordenador"
            dados["coordenador"] = {
                "siape": usuario.coordenador.siape,
            }
        elif hasattr(usuario, "cre"):
            dados["tipo"] = "cre"
            dados["cre"] = {
                "siape": usuario.cre.siape,
            }

        return Response(dados)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from solicitacoes_app.models.campos_solic_models.tipo_falta import TipoFalta

class TipoFaltaView(APIView):
    permission_classes = [IsAuthenticated] # Apenas usuários autenticados podem ver os tipos de falta

    def get(self, request):
        choices = [
            {"value": choice.value, "label": choice.label}
            for choice in TipoFalta
        ]
        return Response(choices)



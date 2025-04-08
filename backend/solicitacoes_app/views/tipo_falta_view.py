from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from solicitacoes_app.models import TipoFalta

class TipoFaltaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        choices = [
            {"value": choice.value, "label": choice.label}
            for choice in TipoFalta
        ]
        return Response(choices)

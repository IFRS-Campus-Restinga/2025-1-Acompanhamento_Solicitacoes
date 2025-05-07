from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from ..models.form_entrega_ativ_compl import FormEntregaAtivCompl
from ..serializers.form_entrega_ativ_compl_serializer import FormEntregaAtivComplSerializer

class FormEntregaAtivComplListCreate(ListCreateAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    permission_classes = [AllowAny]


class FormEntregaAtivComplUpdate(RetrieveUpdateAPIView):
    queryset = FormEntregaAtivCompl.objects.all()
    serializer_class = FormEntregaAtivComplSerializer
    permission_classes = [AllowAny]
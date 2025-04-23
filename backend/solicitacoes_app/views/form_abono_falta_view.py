from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from ..models.form_abono_falta import FormAbonoFalta
from ..serializers.form_abono_falta_serializer import FormAbonoFaltaSerializer

class FormAbonoFaltaViewListCreate(ListCreateAPIView):
    queryset = FormAbonoFalta.objects.all()
    serializer_class = FormAbonoFaltaSerializer
    permission_classes = [AllowAny]


class FormAbonoFaltaViewUpdateDelete(RetrieveUpdateDestroyAPIView):
    queryset = FormAbonoFalta.objects.all()
    serializer_class = FormAbonoFaltaSerializer
    permission_classes = [AllowAny]
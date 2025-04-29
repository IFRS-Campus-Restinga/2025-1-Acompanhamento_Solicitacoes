from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from ..models.form_abono_falta import FormAbonoFalta
from ..serializers.form_abono_falta_serializer import FormAbonoFaltaSerializer

class FormAbonoFaltaViewListCreate(ListCreateAPIView):
    queryset = FormAbonoFalta.objects.all()
    serializer_class = FormAbonoFaltaSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Verificar se o serializer é válido
        if not serializer.is_valid():
            print("Erros de validação no serializer:", serializer.errors)
            raise ValueError(serializer.errors)

        # Salvar os dados se forem válidos
        serializer.save()
        print("Dados salvos com sucesso:", serializer.data)


class FormAbonoFaltaViewUpdateDelete(RetrieveUpdateDestroyAPIView):
    queryset = FormAbonoFalta.objects.all()
    serializer_class = FormAbonoFaltaSerializer
    permission_classes = [AllowAny]
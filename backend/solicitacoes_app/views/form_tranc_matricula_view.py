from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from ..models import FormularioTrancamentoMatricula
from ..serializers.form_tranc_matricula_serializer import FormularioTrancamentoMatriculaSerializer
from datetime import datetime
from rest_framework.response import Response
from ..permissoes import CanSubmitTrancMatricula, CanViewSolicitacaoDetail


class FormTrancamentoCreateWithSolicitacaoView(generics.ListCreateAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanSubmitTrancMatricula] 


    def create(self, request, *args, **kwargs):
        print("🔥 [Django] Dados recebidos no POST:")
        for k, v in request.data.items():
            print(f"   📥 {k}: {v}")

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("❌ Erros de validação:", serializer.errors)
            return Response(serializer.errors, status=400)

        print("✅ Dados validados. Salvando...")
        self.perform_create(serializer)

        print("✅ Salvo com sucesso!")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class FormTrancamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FormularioTrancamentoMatricula.objects.all()
    serializer_class = FormularioTrancamentoMatriculaSerializer
    #permission_classes = [AllowAny]
    permission_classes = [CanViewSolicitacaoDetail] 
    lookup_field = "id"

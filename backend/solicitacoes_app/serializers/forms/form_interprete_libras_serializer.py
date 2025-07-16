from ..solicitacao_serializer import BaseSolicitacaoModelSerializer
from ..models.forms.form_interprete_libras import FormInterpreteLibras

class FormInterpreteLibrasSerializer(BaseSolicitacaoModelSerializer):
    class Meta:
        model = FormInterpreteLibras
        fields = "__all__"
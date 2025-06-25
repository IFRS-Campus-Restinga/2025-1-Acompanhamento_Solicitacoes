from itertools import chain
from ..models import FormTrancDisciplina, FormularioTrancamentoMatricula

def get_todas_as_solicitacoes():
    qs1 = FormTrancDisciplina.objects.all()
    qs2 = FormularioTrancamentoMatricula.objects.all()
    lista_unificada = list(chain(qs1, qs2))
    
    lista_ordenada = sorted(lista_unificada, key=lambda s: s.data_solicitacao, reverse=True)
    
    return lista_ordenada
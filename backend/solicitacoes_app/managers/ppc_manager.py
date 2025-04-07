from .base_manager import BaseManager

class PpcManager(BaseManager):
    def buscar_por_codigo(self, codigo):
        return self.filter(codigo__iexact=codigo)

    def buscar_por_nome_do_curso(self, nome_curso):
        return self.filter(curso__nome__icontains=nome_curso)


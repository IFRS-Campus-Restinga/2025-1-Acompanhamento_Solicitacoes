from .base_manager import BaseManager

class CursoManager(BaseManager):
    def buscar_por_nome(self, nome):
        return self.filter(nome__icontains=nome)
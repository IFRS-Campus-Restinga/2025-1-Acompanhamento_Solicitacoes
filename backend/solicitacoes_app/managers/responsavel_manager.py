from django.db import models

class ResponsavelManager(models.Manager):
    def busca_por_nome_responsavel(self, nome):
        return self.filter(usuario__nome__icontains=nome)

    def busca_por_nome_aluno(self, nome):
        return self.filter(aluno__usuario__nome__icontains=nome)

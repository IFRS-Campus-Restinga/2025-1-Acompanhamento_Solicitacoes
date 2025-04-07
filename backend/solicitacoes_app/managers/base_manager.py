from django.db import models

class BaseManager(models.Manager):
    def ativos(self):
        return self.filter(ativo=True)

    def inativos(self):
        return self.filter(ativo=False)

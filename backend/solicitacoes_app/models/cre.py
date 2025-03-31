from django.db import models
from .usuario import Usuario

class CRE(Usuario):
    siape = models.IntegerField(
        unique=True
    )
    
    def __str__(self):
        return f"{self.nome}-({self.siape})"
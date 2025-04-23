from django.db import models
from django.forms import ValidationError
from .base import BaseModel
from .usuario import Usuario

class CRE(BaseModel):
    usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, related_name="cre"
    )
    siape = models.IntegerField(
        unique=True
    )
    
    ativo = models.BooleanField(default=True)
    
    def delete(self, using=None, keep_parents=False):
        self.ativo = False
        self.save()
    
    
    def clean(self):
        # Verifica se o siape é realmente um inteiro
        if not isinstance(self.siape, int):
            raise ValidationError({'siape': "O SIAPE deve ser um número inteiro."})

        # Verifica se é um inteiro positivo
        if self.siape <= 0:
            raise ValidationError({'siape': "O SIAPE deve ser um número positivo."})


    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"
    
    class Meta:
        verbose_name = "CRE"
        verbose_name_plural = "CREs"   
    

from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator

class Nome(BaseModel):
    nome = models.CharField(
        primary_key=True,
        max_length=255,
        validators=[MinLengthValidator(6)]  
    )
    
    def __str__(self):
        return self.nome
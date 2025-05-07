from django.db import models

class Status(models.TextChoices):
    PEDIDO_CRIADO = "Pedido Criado"
    EM_ANALISE = "Em Análise"
    EM_EMISSAO = "Em Emissão"
    REGISTRADO = "Registrado"
    INDEFERIDO = "Indeferido"
    APROVADO = "Aprovado"
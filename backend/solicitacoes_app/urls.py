from django.urls import path
from .views.estaticas import api_root, saudacao

app_name = 'solicitacoes_app'


urlpatterns = [

    path('', api_root, name="api-root"),
    path('saudacao/', saudacao, name="saudacao"),
]
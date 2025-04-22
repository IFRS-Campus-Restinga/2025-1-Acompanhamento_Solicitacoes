from django.urls import path
from google_auth.views import login_solicitacoes

urlpatterns = [
    path("login/", login_solicitacoes.google_login, name="google_login"),
    path("callback/", login_solicitacoes.google_callback, name="google_callback"),
]

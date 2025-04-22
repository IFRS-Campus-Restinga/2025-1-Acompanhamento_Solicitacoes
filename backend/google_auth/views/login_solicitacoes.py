# google_auth/views/login_solicitacoes.py

import requests
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.conf import settings
from django.conf import settings
from django.http import HttpResponse



def google_login(request):
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"

    params = {
        "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_OAUTH2_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }

    url = f"{base_url}?{urlencode(params)}"
    return redirect(url)

def google_callback(request):
    code = request.GET.get("code")

    if not code:
        return HttpResponse("Código de autorização não encontrado.", status=400)

    # Troca o code pelo token de acesso
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
        "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_OAUTH2_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=data)
    token_json = token_response.json()
    access_token = token_json.get("access_token")

    if not access_token:
        return HttpResponse("Falha ao obter token de acesso.", status=400)

    # Usa o token para buscar os dados do usuário
    userinfo_response = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    userinfo = userinfo_response.json()
    email = userinfo.get("email")
    nome = userinfo.get("name")

    return HttpResponse(f"Usuário logado com sucesso: {nome} ({email})")
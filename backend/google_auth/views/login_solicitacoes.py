# google_auth/views/login_solicitacoes.py (Arquivo Modificado v2)

import requests
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.contrib.auth import get_user_model, login
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from google_auth.serializers import get_tokens_for_user


User = get_user_model() 

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
    error = request.GET.get("error")

    if error:
        return JsonResponse({"error": error, "error_description": request.GET.get("error_description")}, status=400)

    if not code:
        return JsonResponse({"error": "Authorization code not found in request."}, status=400)

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
        "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_OAUTH2_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    try:
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        google_tokens = token_response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Google token: {e}")
        return JsonResponse({"error": "Failed to fetch token from Google.", "details": str(e)}, status=500)

    id_token_jwt_google = google_tokens.get("id_token")

    if not id_token_jwt_google:
        return JsonResponse({"error": "Google ID token not found in response from Google."}, status=500)

    try:
        id_info = google_id_token.verify_oauth2_token(
            id_token_jwt_google, 
            google_requests.Request(), 
            settings.GOOGLE_OAUTH2_CLIENT_ID,
            # clock_skew_in_seconds=60 # Descomente se necessário ajustar a tolerância do relógio
        )
        
        if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        user_email_from_google = id_info.get("email")
        user_name_from_google = id_info.get("name") 
        user_picture_from_google = id_info.get("picture")

        if not user_email_from_google:
            return JsonResponse({"error": "Email not found in Google ID token."}, status=400)

    except ValueError as e:
        print(f"Invalid Google ID token: {e}")
        return JsonResponse({"error": "Invalid Google ID token.", "details": str(e)}, status=400)

    try:
        user = User.objects.filter(email=user_email_from_google).first()
    

        if user:
            # Usuário EXISTE: Fazer login e redirecionar DIRETAMENTE para Minhas Solicitações com token
            print(f"Usuário encontrado: {user_email_from_google}. Redirecionando para Minhas Solicitações.")
            
            # Opcional: Atualizar o nome se ele mudou no Google
            if user.nome != user_name_from_google and user_name_from_google:
                user.nome = user_name_from_google
                user.save(update_fields=["nome"])

            login(request, user)

            try:
                app_tokens = get_tokens_for_user(user, 
                                                 user_picture_url=user_picture_from_google, 
                                                 user_full_name=user.nome)
            except Exception as e:
                print(f"Error generating app tokens: {e}")
                return JsonResponse({"error": "Failed to generate application tokens.", "details": str(e)}, status=500)
                
            access_token_app = app_tokens.get("access")

            if not access_token_app:
                return JsonResponse({"error": "Failed to generate application access token."}, status=500)

    ##CODIGO PEDRO ANTIGO
        
            # --- ALTERAÇÃO: Redireciona diretamente para Minhas Solicitações --- 
            #frontend_redirect_url = f"http://localhost:3000/aluno/minhas-solicitacoes?access_token={access_token_app}"
            #print(f"Redirecionando usuário existente para: {frontend_redirect_url}") # Log para clareza
            #return HttpResponseRedirect(frontend_redirect_url)
            # --- FIM DA ALTERAÇÃO --- 

    ##FINAL DO CODIGO PEDRO

            # --- ALTERAÇÃO AQUI: Aponte para a rota do GoogleRedirectHandler no frontend --- 
            frontend_redirect_url = f"http://localhost:3000/auth/google/redirect-handler?access_token={access_token_app}"
            print(f"Redirecionando usuário existente para: {frontend_redirect_url}") 
            return HttpResponseRedirect(frontend_redirect_url)
            # --- FIM DA ALTERAÇÃO NOVA--- 

        else:
            # Usuário NÃO EXISTE: Redirecionar para a página de cadastro/seleção no frontend
            print(f"Usuário NÃO encontrado: {user_email_from_google}. Redirecionando para cadastro/seleção.")
            
            google_data = {
                "google_email": user_email_from_google,
                "google_name": user_name_from_google or "", # Garante que não seja None
                "google_picture": user_picture_from_google or "" # Garante que não seja None
            }
            query_params = urlencode(google_data)

            # Verifica o domínio do email para decidir a URL de redirecionamento
            if "@ifrs" in user_email_from_google.lower():
                # Email institucional: vai para seleção de grupo
                frontend_redirect_url = f"http://localhost:3000/usuarios/selecionargrupo?{query_params}"
            else:
                # Email não institucional: vai para cadastro geral
                frontend_redirect_url = f"http://localhost:3000/usuarios/cadastro?{query_params}"
            
            return HttpResponseRedirect(frontend_redirect_url)

    except Exception as e:
        # Captura qualquer outra exceção durante a busca ou lógica de redirecionamento
        print(f"Error during user check/redirect logic: {e}")
        return JsonResponse({"error": "An unexpected error occurred during the login process.", "details": str(e)}, status=500)


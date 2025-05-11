from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user, user_picture_url=None, user_full_name=None):
    """
    Gera tokens JWT (access e refresh) para um usuário,
    adicionando claims personalizadas ao payload do token.
    """
    refresh = RefreshToken.for_user(user)


    refresh.payload["email"] = user.email

    if user_full_name:
        refresh.payload["name"] = user_full_name
    elif user.first_name and user.last_name:
        refresh.payload["name"] = f"{user.first_name} {user.last_name}"
    elif user.first_name:
        refresh.payload["name"] = user.first_name
    else:
        refresh.payload["name"] = user.username

    if user_picture_url:
        refresh.payload["picture"] = user_picture_url


    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


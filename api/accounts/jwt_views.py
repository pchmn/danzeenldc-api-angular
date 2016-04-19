from calendar import timegm
from datetime import datetime

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_jwt.compat import get_username_field, get_username
from rest_framework_jwt.serializers import RefreshJSONWebTokenSerializer

from accounts.serializers import UserSerializerLogin
from rest_framework_jwt.settings import api_settings
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER


def jwt_response_payload_handler(token, user=None, request=None):
    """
    Retourne les infos de l'utilisateur avec le token
    """
    payload = {
        'token': token,
        'user': UserSerializerLogin(user).data
    }

    if api_settings.JWT_ALLOW_REFRESH:
        payload_refresh_token = jwt_payload_refresh_token(user)
        refresh_token = jwt_encode_handler(payload_refresh_token)
        payload['refresh_token'] = refresh_token

    return payload


def jwt_payload_refresh_token(user):
    """
    Créer un refresh token
    """
    username_field = get_username_field()
    username = get_username(user)

    payload = {'exp': datetime.utcnow() + api_settings.JWT_REFRESH_EXPIRATION_DELTA,
               username_field: username,
               'orig_iat': timegm(
                   datetime.utcnow().utctimetuple()
               )}

    if api_settings.JWT_AUDIENCE is not None:
        payload['aud'] = api_settings.JWT_AUDIENCE

    if api_settings.JWT_ISSUER is not None:
        payload['iss'] = api_settings.JWT_ISSUER

    return payload


class RefreshJWT(APIView):
    """
    Rafraichir un token
    """
    serializer_class = RefreshJSONWebTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            token = serializer.object.get('token')
            return Response({"token": token})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
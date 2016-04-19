from django.contrib.auth import logout, login
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.decorators import permission_classes, api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import UserSerializer, UserSerializerLogin


class UserList(generics.ListCreateAPIView):
    """
    Récupère la liste des utilisateurs
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetails(generics.RetrieveAPIView):
    """
    Récupère les détaisl d'un utilisateur
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'


class LoginView(APIView):
    """
    Connexion de l'utilisateur
    """
    serializer_class = AuthTokenSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        # remember_me option
        if not request.data.get('remember_me', None):
            request.session.set_expiry(0)
        login(request, user)
        return Response({
            'user': UserSerializerLogin(user).data,
        })


class LogoutView(APIView):
    """
    Déconnexion de l'utilisateur
    """
    def get(self, request):
        if not request.user.is_authenticated():
            return Response({"detail": "Déjà déconnecté."})
        logout(request)
        return Response({"detail": "Déconnexion réussie."})

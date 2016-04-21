from django.contrib.auth.models import User, Permission
from rest_framework import serializers
from rest_framework.validators import UniqueValidator


class UserSerializer(serializers.ModelSerializer):
    articles = serializers.StringRelatedField(many=True, read_only=True)
    password = serializers.CharField(required=True, write_only=True)
    email = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all(),
                                                               message="Un utilisateur avec cet email existe déjà.")],
                                   required=False,
                                   allow_blank=True,
                                   write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'articles', 'password', 'email')
        read_only_fields = ('articles',)


class UserSerializerLogin(serializers.ModelSerializer):
    is_writer = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('username', 'email', 'is_writer', 'is_admin')

    def get_is_writer(self, instance):
        return instance.has_perm('articles.add_article')

    def get_is_admin(self, instance):
        return instance.is_staff

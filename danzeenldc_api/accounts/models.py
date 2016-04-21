from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver

from jsonfield import JSONField
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token


class UserProfile(models.Model):
    """
    Classe qui représente des informations supplémentaires
    pour un utilisateur
    """
    user = models.OneToOneField(User, related_name="profile")
    article_views = JSONField(verbose_name="Articles vues", default=[], blank=True)
    article_votes = JSONField(verbose_name="Articles votés", default={}, blank=True)
    comment_votes = JSONField(verbose_name="Commentaires votés", default={}, blank=True)


@receiver(post_save, sender=User)
def create_auth_token_and_user_profile(sender, instance=None, created=False, **kwargs):
    """
    Crée un profile et un token pour chaque utilisateur
    """
    if created:
        Token.objects.create(user=instance)
        UserProfile.objects.create(user=instance)

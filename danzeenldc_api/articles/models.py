from django.contrib.auth.models import User
from django.core.validators import MaxLengthValidator
from django.db import models
from articles.utils import unique_slugify, bleach_html


class Article(models.Model):
    """
    Classe qui représente un article
    Chaque article est lié à un utilisateur qui en est l'auteur
    """
    title = models.CharField(max_length=200, verbose_name="Titre")
    slug = models.SlugField(unique=True, max_length=100, verbose_name="Slug")
    intro = models.TextField(verbose_name="Introduction", blank=True, null=True, validators=[MaxLengthValidator(500)])
    content = models.TextField(verbose_name="Contenu")
    author = models.ForeignKey(User, verbose_name="Auteur", related_name="articles")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")
    views = models.IntegerField(default=0, verbose_name="Nombre de vues")
    likes = models.IntegerField(default=0, verbose_name="Nombre de likes")
    dislikes = models.IntegerField(default=0, verbose_name="Nombre de dislikes")
    score = models.IntegerField(default=0, verbose_name="Score")

    def save(self, *args, **kwargs):
        # bleach title, intro, content
        self.title = bleach_html(self.title, True)
        self.intro = bleach_html(self.intro, True)
        self.content = bleach_html(self.content)
        # slug
        unique_slugify(self, self.title)
        # update score
        self.score = self.likes - self.dislikes
        super(Article, self).save(*args, **kwargs)

    def __str__(self):
        return self.slug


class Comment(models.Model):
    """
    Classe qui représente les commentaires d'un article
    Chaque commentaire est lié à un article et à un utilisateur
    """
    content = models.TextField(verbose_name="Contenu", validators=[MaxLengthValidator(500)])
    author = models.CharField(max_length=50, verbose_name="Auteur", blank=True, default="Anonyme")
    likes = models.IntegerField(default=0, verbose_name="Nombre de likes")
    dislikes = models.IntegerField(default=0, verbose_name="Nombre de dislikes")
    score = models.IntegerField(default=0, verbose_name="Score")
    date = models.DateTimeField(auto_now_add=True, verbose_name="Date")
    article = models.ForeignKey(Article, verbose_name="Article", related_name="comments")

    def save(self, *args, **kwargs):
        # bleach author and content
        if self.author == "":
            self.author = "Anonyme"
        self.author = bleach_html(self.author, True)
        self.content = bleach_html(self.content, True)
        # update score
        self.score = self.likes - self.dislikes
        super(Comment, self).save(*args, **kwargs)

    def __str__(self):
        return self.content

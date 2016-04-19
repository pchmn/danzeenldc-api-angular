from django.shortcuts import get_object_or_404
from rest_framework import mixins, generics, status
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from articles.models import Article
from articles.permissions import IsOwnerOrAdminOrReadOnly, IsWriterOrReadOnly

# ---------------------------------------
#           VUES ANNEXES
# ---------------------------------------


@permission_classes((IsWriterOrReadOnly,))
class CanWriteArticle(APIView):
    """
    Vérifie que l'utilisateur peut écrire un article
    """
    def post(self, request):
        return Response({"detail": "ok"})


class CanEditDeleteArticle(generics.GenericAPIView):
    """
    Vérifie que l'utilisateur peut modifier ou supprimer un article
    """
    def post(self, request, slug):
        article = Article.objects.get(slug=slug)
        if request.user == article.author or request.user.is_staff:
            return Response({"detail": "ok"})
        return Response({"detail": "Vous n'avez pas la permission d'effectuer cette action."}, status=status.HTTP_403_FORBIDDEN)


# ---------------------------------------
#           FONCTIONS ANNEXES
# ---------------------------------------
def has_viewed_article(request, pk):
    """
    Augmente le nombre de vues à chaque visite unique
    """
    user = request.user
    article = get_object_or_404(Article, pk=pk)

    if request.user.is_authenticated():
        if article.pk not in user.profile.article_views:
            article.views += 1
            article.save()
            user.profile.article_views.append(article.id)
            user.profile.save()
    else:
        if 'article_views' in request.session:
            article_views = request.session['article_views']
            if article.pk not in article_views:
                article.views += 1
                article.save()
                article_views.append(article.id)
                request.session['article_views'] = article_views
        else:
            article.views += 1
            article.save()
            request.session['article_views'] = [article.id]

    return article


def has_voted_article(request, pk):
    """
    Vérifie si un utilisateur a déjà voté pour un article
    """
    user = request.user

    if user.is_authenticated():
        if str(pk) in user.profile.article_votes:
            return user.profile.article_votes[str(pk)]
        else:
            return None
    else:
        if 'article_votes' in request.session:
            if str(pk) in request.session['article_votes']:
                return request.session['article_votes'][str(pk)]
            else:
                return None
        else:
            return None


def has_voted_comment(request, pk):
    """
    Vérifie si un utilisateur a déjà voté pour un article
    """
    user = request.user

    if user.is_authenticated():
        if str(pk) in user.profile.comment_votes:
            return user.profile.comment_votes[str(pk)]
        else:
            return None
    else:
        if 'comment_votes' in request.session:
            if str(pk) in request.session['comment_votes']:
                return request.session['comment_votes'][str(pk)]
            else:
                return None
        else:
            return None

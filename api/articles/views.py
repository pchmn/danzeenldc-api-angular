from collections import OrderedDict

from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, mixins, status
from rest_framework.decorators import permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from articles.models import Article, Comment
from articles.serializers import ArticleSerializer, CommentSerializer, VoteSerializer
from articles.permissions import IsOwnerOrAdminOrReadOnly, IsWriterOrReadOnly, IsOwnerOrAdmin
from articles.views_extras import has_viewed_article, has_voted_article, has_voted_comment


class StandardResultsSetPagination(PageNumberPagination):
    """
    Pagination par 10 objets
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('pages', self.get_pages()),
            ('results', data)
        ]))

    def get_next_page_number(self):
        if not self.page.has_next():
            return None
        return self.page.next_page_number()

    def get_previous_page_number(self):
        if not self.page.has_previous():
            return None
        return self.page.previous_page_number()

    def get_pages(self):
        return OrderedDict([
            ('total', self.page.paginator.num_pages),
            ('current', self.page.number),
            ('next', self.get_next_page_number()),
            ('previous', self.get_previous_page_number())
        ])


@permission_classes((IsWriterOrReadOnly,))
class ArticleList(generics.ListCreateAPIView):
    """
    Permet de :
        • récupérer la liste des articles (tri possible)
        • créer un nouvel article selon les permission
    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('date', 'views', 'score')
    ordering = ('-date',)

    def perform_create(self, serializer):
        """
        ajout automatique de l'auteur
        """
        serializer.save(author=self.request.user)


@permission_classes((IsWriterOrReadOnly, IsOwnerOrAdminOrReadOnly))
class ArticleDetail(generics.RetrieveUpdateAPIView):
    """
    Permet de :
        • récupérer le détails d'un article
        • modifier (si auteur), supprimer un produit si admin
    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    lookup_field = 'slug'

    def get(self, request, *args, **kwargs):
        article = self.get_object()
        # ajout des vues sur l'article
        article = has_viewed_article(request, article.pk)
        serializer = ArticleSerializer(article)
        has_voted = has_voted_article(request, article.pk)
        return Response(
            OrderedDict([
                ('article', serializer.data),
                ('has_voted', has_voted)
            ]))

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


@permission_classes((IsOwnerOrAdmin,))
class ArticleUpdateDelete(generics.UpdateAPIView, generics.DestroyAPIView):
    """
    Permet de :
        • récupérer le détails d'un article
        • modifier (si auteur), supprimer un produit si admin
    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    lookup_field = 'slug'

    def get_object(self):
        obj = get_object_or_404(Article, slug=self.kwargs['slug'])
        obj_res = has_viewed_article(self.request, obj)
        return obj_res


class CommentList(generics.ListCreateAPIView):
    """
    Permet de :
        • récupérer la liste des commentaires d'un article
        • créer un nouveau commentaire pour l'article
    """
    serializer_class = CommentSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('date', 'score')
    ordering = ('-date',)

    def get_queryset(self):
        article = self.kwargs['article']
        return Comment.objects.filter(article=article)

    def create(self, request, *args, **kwargs):
        """
        ajout automatique de l'article
        """
        article = get_object_or_404(Article, pk=self.kwargs['article'])
        request.data['article'] = article.pk
        if request.user.is_authenticated():
            request.data['author'] = request.user.username
        return super(CommentList, self).create(request, *args, **kwargs)


class VoteArticle(APIView):
    """
    Vote pour un article
    """
    serializer_class = VoteSerializer

    def post(self, request, pk):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        vote = serializer.validated_data['vote']
        article = get_object_or_404(Article, pk=pk)
        user = request.user
        article_votes = {}
        old_vote = has_voted_article(request, pk)

        if old_vote and old_vote == vote:
            return Response({'details': 'même vote déjà effectué'}, status=status.HTTP_403_FORBIDDEN)

        # ajout du vote
        if vote == "like_article":
            article.likes += 1
            # si l'utilisateur avait déjà voté on rectifie le nb de dislikes
            if old_vote and article.dislikes > 0:
                article.dislikes -= 1

        elif vote == "dislike_article":
            article.dislikes += 1
            # si l'utilisateur avait déjà voté on rectifie le nb de likes
            if old_vote and article.likes > 0:
                article.likes -= 1

        else:
            return Response({'details': 'vote non valide'}, status=status.HTTP_403_FORBIDDEN)

        # enregistement de l'article
        article.save()
        # enregistrement du vote pour l'utilisateur
        if user.is_authenticated():
            user.profile.article_votes[pk] = vote
            user.profile.save()
        else:
            if 'article_votes' in request.session:
                article_votes = request.session['article_votes']
            article_votes[pk] = vote
            request.session['article_votes'] = article_votes
            print(request.session['article_votes'])

        return Response({'details': 'vote effectué'})


class VoteComment(APIView):
    """
    Vote pour un commentaire
    """
    serializer_class = VoteSerializer

    def post(self, request, pk):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        vote = serializer.validated_data['vote']
        comment = get_object_or_404(Comment, pk=pk)
        user = request.user
        comment_votes = {}
        old_vote = has_voted_comment(request, pk)

        if old_vote and old_vote == vote:
            return Response({'details': 'même vote déjà effectué'}, status=status.HTTP_403_FORBIDDEN)

        # ajout du vote
        if vote == "like_comment":
            comment.likes += 1
            # si l'utilisateur avait déjà voté on rectifie le nb de dislikes
            if old_vote and comment.dislikes > 0:
                comment.dislikes -= 1

        elif vote == "dislike_comment":
            comment.dislikes += 1
            # si l'utilisateur avait déjà voté on rectifie le nb de likes
            if old_vote and comment.likes > 0:
                comment.likes -= 1

        else:
            return Response({'details': 'vote non valide'}, status=status.HTTP_403_FORBIDDEN)

        # enregistement du commentaire
        comment.save()
        # enregistrement du vote pour l'utilisateur
        if user.is_authenticated():
            user.profile.comment_votes[pk] = vote
            user.profile.save()
        else:
            if 'comment_votes' in request.session:
                comment_votes = request.session['comment_votes']
            comment_votes[pk] = vote
            request.session['comment_votes'] = comment_votes

        return Response({'details': 'vote effectué'})

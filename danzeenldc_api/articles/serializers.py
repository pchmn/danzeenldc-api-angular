from django.shortcuts import get_object_or_404
from rest_framework import serializers

from articles.models import Article, Comment
from articles.views_extras import has_voted_comment


class ArticleSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source="author.username")

    class Meta:
        model = Article
        fields = ('id', 'author', 'slug', 'title', 'intro', 'content', 'date', 'views', 'likes', 'dislikes', 'score')
        read_only_fields = ('slug', 'date', 'views', 'likes', 'dislikes', 'score')


class CommentSerializer(serializers.ModelSerializer):
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'article', 'author', 'content', 'score', 'date', 'has_voted')
        read_only_fields = ('score', 'date')

    def get_has_voted(self, instance):
        return has_voted_comment(self.context['request'], instance.pk)


class VoteSerializer(serializers.Serializer):
    vote = serializers.CharField()

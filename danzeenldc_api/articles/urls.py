from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from articles import views, views_extras

urlpatterns = [
    url(r'^$', views.ArticleList.as_view(), name="article_list"),
    url(r'^(?P<slug>[-_\w]+)/$', views.ArticleDetail.as_view(), name="article_detail"),
    url(r'^(?P<article>[0-9]+)/comments/$', views.CommentList.as_view(), name="comment_list"),
    url(r'^vote-article/(?P<pk>[0-9]+)/$', views.VoteArticle.as_view(), name="vote_article"),
    url(r'^vote-comment/(?P<pk>[0-9]+)/$', views.VoteComment.as_view(), name="vote_comment"),
    url(r'^has-perm/write-article/$', views_extras.CanWriteArticle.as_view(), name="can_write_article"),
    url(r'^has-perm/edit-article/(?P<slug>[-_\w]+)/$', views_extras.CanEditDeleteArticle.as_view(), name="can_edit_article"),
]

urlpatterns = format_suffix_patterns(urlpatterns)

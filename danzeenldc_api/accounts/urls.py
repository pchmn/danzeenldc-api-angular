from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from accounts import views

urlpatterns = [
    url(r'^$', views.UserList.as_view(), name="user_list"),
    url(r'^(?P<username>[\w.@+-]+)/$', views.UserDetails.as_view(), name="user_details"),
]

urlpatterns = format_suffix_patterns(urlpatterns)

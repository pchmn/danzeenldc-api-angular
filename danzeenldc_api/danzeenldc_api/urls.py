"""danzeenldc_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from rest_framework.authtoken.views import obtain_auth_token
from django.views.generic import TemplateView
from danzeenldc_api import views
from rest_framework_jwt.views import obtain_jwt_token
from accounts.jwt_views import RefreshJWT

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/jwt-auth/', obtain_jwt_token),
    url(r'^api/jwt-refresh/', RefreshJWT.as_view()),
    url(r'^api/home/', views.api_root, name="api_root"),
    url(r'^api/articles/', include('articles.urls')),
    url(r'^api/users/', include('accounts.urls')),
    url(r'^.*$', TemplateView.as_view(template_name="index.html")),
]


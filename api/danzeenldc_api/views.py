from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(('GET',))
@permission_classes((permissions.AllowAny, ))
def api_root(request, format=None):
    return Response({
        'users': reverse('user_list', request=request, format=format),
        'articles': reverse('article_list', request=request, format=format)
    })
from rest_framework import permissions

from articles.models import Article


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object, or admin to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.author == request.user or request.user.is_staff


class IsWriterOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow user who have permissions to write an article
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to users who have permissions
        return request.user.has_perm('articles.add_article')


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object, or admin to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the snippet.
        return obj.author == request.user or request.user.is_staff

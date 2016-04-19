from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from articles.models import Article


class ArticleTest(APITestCase):

    url_list = reverse("article_list")
    url_detail = reverse("article_detail", args=['titre-1'])

    def setUp(self):
        # création d'un admin
        admin = User.objects.create_user('admin', password='adminpassword')
        admin.is_staff = True
        admin.save()
        self.admin = admin
        # création d'un utilisateur sans droit
        reader = User.objects.create_user('reader', password='readerpassword')
        reader.save()
        self.reader = reader
        # création d'un utilisateur ayant des droits
        writer = User.objects.create_user('writer', password='writerpassword')
        writer.has_perm('articles.add_article')
        writer.save()
        self.writer = writer
        # création de plusieurs articles
        a1 = Article(title="titre 1", content="content 1", author=writer, views=1)
        a1.save()
        a2 = Article(title="titre 2", content="content 2", author=admin, likes=1)
        a2.save()

    def test_get_article_list(self):
        """
        Vérifie qu'on récupère bien la liste des articles
        """
        response = self.client.get(self.url_list)
        right_resp_pages = {
            "total": 1,
            "current": 1,
            "next": None,
            "previous": None
        }
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['pages'], right_resp_pages)
        self.assertEqual(response.data['results'][0]['title'], "titre 2")

    def test_get_article_list_order(self):
        """
        Vérifie que les filtres fonctionnent sur la liste des articles
        """
        response1 = self.client.get(self.url_list + "?order=-views")
        response2 = self.client.get(self.url_list + "?order=-score")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.data['results'][0]['title'], "titre 1")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['results'][0]['title'], "titre 2")

    def test_get_article_list_page(self):
        """
        Vérifie que la pagination fonctionne sur la liste des articles
        """
        response1 = self.client.get(self.url_list + "?page=1")
        response2 = self.client.get(self.url_list + "?page=2")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.data['results'][0]['title'], "titre 2")
        self.assertEqual(response2.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_detail_article(self):
        """
        Vérifie qu'on récupère bien le détail d'un article
        """
        response = self.client.get(self.url_detail)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "titre 1")

    def test_create_article(self):
        """
        Vérifie que la création d'un article n'est pas accessible à tout le monde
        """
        article = {
            "title": "titre test",
            "content": "content test"
        }
        response1 = self.client.post()

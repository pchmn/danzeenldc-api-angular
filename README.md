# Code source du site danzeenldc.com

## Fonctionnalités du site
Le [site](https://danzeenldc.com) est consultable par tout le monde. C'est un site sur lequel on peut lire des articles, voter pour des articles, poster des commentaires et voter pour des commentaires. Il y a également une partie authentification qui permet de créer un compte et de se connecter. 
<br>
La lecture des articles, le vote des articles, la création de commentaires et le vote de commentaires ne nécessitent pas d'avoir un compte utilisateur. 
<br>
La création des articles est réservée aux utilisateurs ayant les bonnes permissions.

## Architecture du site
Le site est structuré à l'aide d'une API Rest (Django Rest Framework) côté serveur, et d'un framework Javascript (AngularJS) côté client.

### API Rest
L'API est écrite en python et se trouve dans le dossier *danzeenldc_api*. Elle contient les dépendances suivantes (visibles également dans le fichier *danzeenldc_api/requirements.txt*) :
* [django](https://www.djangoproject.com/) : Django est la base de l'application dont dépend Django Rest Framework
* [djangorestframework](http://www.django-rest-framework.org/) : Django Rest Framework est l'outil qui se greffe à Django et qui permet faciliter la création de l'API gâce à des serializers, des vues adaptées, ...
* [mysqlclient](https://github.com/PyMySQL/mysqlclient-python) : MySQL est le système de base de données utilisé dans l'application. Le connecteur python utilisé est donc mysqlclient
* [djangorestframework-jwt](https://github.com/GetBlimp/django-rest-framework-jwt) : Le système d'authentification utilisé dans l'api est basé sur les [JSON Web Tokens] (https://auth0.com/learn/json-web-tokens/)
* [django-redis-sessions](https://github.com/martinrusev/django-redis-sessions), [django-redis-cache](https://github.com/sebleier/django-redis-cache) : [Redis](http://redis.io/) est utilisé pour le cache et la gestion des sessions au sein de l'API
* [jsonfield](https://github.com/bradjasper/django-jsonfield) : C'est un "field" Django permettant d'enregistrer des JSON dans les modèles. Il est notamment utilisé pour stocker les vues d'articles et les votes effectués pour chaque utilisateur qui a un compte
* [bleach](https://pypi.python.org/pypi/bleach) : C'est un outil qui "sanitize" du contenu HTML. Il est utilisé lors de la création des articles et des commentaires et permet de sécuriser leur contenu


### Framework Javascript (AngularJS)
Côté client AngularJS est utilisé. En voici ses dépendances : 
* 

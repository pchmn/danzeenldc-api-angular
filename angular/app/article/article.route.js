app.config(function($stateProvider) {
    $stateProvider
        .state('articleDetail', {
            abstract: true,
            url: "/article/:slug",
            templateUrl: '/angular/app/article/article.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.slugNotEmpty();
                }]
            },
            controller: 'ArticleDetailController',
            data : { pageTitle: 'Lis attentivement...' }
        })
        .state('articleDetail.views', {
            url: "",
            views: {
                "article_template": {
                    templateUrl: '/angular/app/article/detail/article_detail.html'
                },
                "comments_template": {
                    templateUrl: '/angular/app/article/detail/article_comments.html'
                }
            }
        })
        .state('createArticle', {
            url: "/create-article",
            templateUrl: '/angular/app/article/create_update/create_update_article.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.hasWritePerm();
                }]
            },
            controller: 'CreateArticleController',
            data : { pageTitle: 'Créer un article' }
        })
        .state('updateArticle', {
            url: "/update/:slug",
            templateUrl: '/angular/app/article/create_update/create_update_article.html',
            resolve: {
                protect:  ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.hasUpdatePerm();
                }]
            },
            controller: 'UpdateArticleController',
            authenticate: true,
            data : { pageTitle: 'Modifier l\'article' }
        })
});

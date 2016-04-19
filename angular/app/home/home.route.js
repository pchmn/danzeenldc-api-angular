app.config(function($stateProvider) {
    $stateProvider
        .state('home', {
            url: "/?p&o",
            views: {
                "" : {
                    templateUrl: '/angular/app/home/home.html'
                },
                "article_list@home": {
                    templateUrl: '/angular/app/home/article_list/article_list.html',
                    controller: 'ArticleListController'
                },
                "infos@home": {
                    templateUrl: '/angular/app/home/infos/infos.html',
                    controller: 'InfosController'
                }
            },
            data : { pageTitle: 'Accueil' }
        });
});

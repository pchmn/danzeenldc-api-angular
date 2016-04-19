app.config(function($stateProvider) {
    $stateProvider
        .state('error404', {
            templateUrl: '/angular/app/errors/404.html',
            data : { pageTitle: 'Oups...' }
        })
        .state('error403', {
            url: "/forbidden",
            templateUrl: '/angular/app/errors/403.html',
            data : { pageTitle: 'Oups...' }
        })
});

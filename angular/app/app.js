var app = angular.module('app', ['ngMaterial', 'ngMessages', 'ngResource', 'ngSanitize', 'ui.router', 'angular-jwt', 'md.directives', 'ui.tinymce']);

/**
 * Configs de base
 */
app
.config(function($urlRouterProvider, $locationProvider, $resourceProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');
    // enlever le # dans les urls
    $locationProvider.html5Mode(true);
    // Laisser le slash final lors des requêtes
    $resourceProvider.defaults.stripTrailingSlashes = false;
    // csrf token pour chaque requête
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    // error interceptor
    $httpProvider.interceptors.push('HttpErrorInterceptor');
})

/**
 * Gère l'envoi du jwt pour chaque requête
 */
.config(function Config($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function(jwtHelper, $http, config, Auth, Session) {

        // pour les fichiers statiques on n'envoie pas le token
        if (config.url.substr(config.url.length - 5) == '.html' ||
            config.url.substr(config.url.length - 5) == '.json' ||
            config.url.substr(config.url.length - 5) == '.css'  ||
            config.url.substr(config.url.length - 5) == '.js') {
          return null;
        }

        // si non connecté on n'envoie pas le token
        if(!Auth.isAuthenticated()) {
            return null;
        }

        if(jwtHelper.isTokenExpired(Session.authToken)) {
            return Auth.refreshAuthToken();
        }

        return Session.authToken;

    };

    $httpProvider.interceptors.push('jwtInterceptor');
});


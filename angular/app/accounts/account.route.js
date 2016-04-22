app.config(function($stateProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: '/angular/app/accounts/auth/login.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.isNotAuthenticated();
                }]
            },
            controller: 'AuthController',
            data : { pageTitle: 'Connexion' }
        })
        .state('register', {
            url: "/register",
            templateUrl: '/angular/app/accounts/user/register.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.isNotAuthenticated();
                }]
            },
            controller: 'UserController',
            data : { pageTitle: 'Inscription' }
        });
});

/**
 * Resolve pour vérifier qu'un utilisateur n'est pas connecté
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @param Toast
 * @returns {*}
 * @private
 */

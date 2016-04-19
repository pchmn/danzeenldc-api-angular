app.config(function($stateProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: '/angular/app/accounts/auth/login.html',
            resolve: {
                protect: _isNotAuthenticated
            },
            controller: 'AuthController',
            data : { pageTitle: 'Connexion' }
        })
        .state('register', {
            url: "/register",
            templateUrl: '/angular/app/accounts/user/register.html',
            resolve: {
                protect: _isNotAuthenticated
            },
            controller: 'UserController',
            data : { pageTitle: 'Inscription' }
        });
});
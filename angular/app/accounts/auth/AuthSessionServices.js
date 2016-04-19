/**
 * Service qui gère les authentifications
 */
app.factory('Auth', function($rootScope, $resource, $http, $q, $state, Session) {

    var urlAuthJwt = "/api/jwt-auth/";
    var urlRefreshJwt = "/api/jwt-refresh/";
    var service = {};

    /**
     * Teste si l'utilisateur est connecté
     */
    service.isAuthenticated = function() {
        return Session.user !== null && Session.authToken !== null && Session.refreshToken;
    };

    /**
     * Authentifie l'utilisateur
     */
    service.authUser = function(data) {
        var loginRes = $resource(urlAuthJwt);
        var def = $q.defer();

        loginRes.save(data)
            .$promise.then(
                // success
                function(response) {
                    Session.setUser(response.user, data.remember_me);
                    Session.setAuthToken(response.token, data.remember_me);
                    Session.setRefreshToken(response.refresh_token, data.remember_me);
                    def.resolve(response);
                },
                // error
                function(error) {
                    Session.destroy();
                    def.reject(error);
                }
            );

        return def.promise;
    };

    /**
     * Rafraichit un token avec le refresh token
     */
    service.refreshAuthToken = function() {

        if(!service.isAuthenticated()) {
            Session.destroy();
            return null;
        }

        var refreshRes = $http({
            url: urlRefreshJwt,
            skipAuthorization: true,
            method: 'POST',
            data: {token: Session.refreshToken}
        });

        return refreshRes.then(
                // success
                function(response) {
                    Session.setAuthToken(response.data.token);
                    return Session.authToken;
                },
                // error
                function(error) {
                    return null;
                }
            );
    };

    /**
     * Déconnecte l'utilisateur
     */
    service.logoutUser = function() {
        Session.destroy();
        $state.go($state.$current, null, { reload: true });
    };

    return service;
});


/**
 * Service qui gère les sessions
 */
app.factory('Session', function() {

    var session = {};

    // instancier les données
    session.user = localStorage.getObject('user') || sessionStorage.getObject('user');
    session.authToken = localStorage.getObject('authToken') || sessionStorage.getObject('authToken');
    session.refreshToken = localStorage.getObject('refreshToken') || sessionStorage.getObject('refreshToken');

    /**
     * Ajoute l'utilisateur à la session
     */
    session.setUser = function(user, rememberMe) {
        session.user = user;
        if(rememberMe)
            localStorage.setObject('user', user);
        else
            sessionStorage.setObject('user', user);
    };

    /**
     * Ajoute le token à la session
     */
    session.setAuthToken = function(authToken, rememberMe) {
        session.authToken = authToken;
        if(rememberMe)
            localStorage.setObject('authToken', authToken);
        else
            sessionStorage.setObject('authToken', authToken);
    };

    /**
     * Ajoute le refresh token à la session
     */
    session.setRefreshToken = function(refreshToken, rememberMe) {
        session.refreshToken = refreshToken;
        if(rememberMe)
            localStorage.setObject('refreshToken', refreshToken);
        else
            sessionStorage.setObject('refreshToken', refreshToken);
    };

    /**
     * Supprime l'utilisateur de la session
     */
    session.deleteUser = function() {
        session.user = null;
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    };

    /**
     * Supprime le token de la session
     */
    session.deleteAuthToken = function() {
        session.authToken = null;
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    };

    /**
     * Supprime le refresh token de la session
     */
    session.deleteRefreshToken = function() {
        session.refreshToken = null;
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
    };

    /**
     * Supprime la session
     */
    session.destroy = function() {
        session.deleteUser();
        session.deleteAuthToken();
        session.deleteRefreshToken();
    };

    return session;

});

/**
 * Ajouter auth et session à $rootScope
 */
app.run(function($rootScope, Auth, Session) {
    $rootScope.auth = Auth;
    $rootScope.session = Session;
    $rootScope.buttonCreateEdit = {};
});

/**
 * Serialise, désérialise les objets en local et session storage
 */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
};

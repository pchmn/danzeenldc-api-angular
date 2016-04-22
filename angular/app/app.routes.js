/**
 * Enregistrer le state précédent
 * Pour rediriger après une connexion
 */
app.run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
        var oldPrevState = $rootScope.previousState;
        var oldPrevStateParams = $rootScope.previousStateParams;

        if(fromState.name === "") {
            $rootScope.previousState = toState.name;
            $rootScope.previousStateParams = toParams;
        }
        else {
            $rootScope.previousState = fromState.name;
            $rootScope.previousStateParams = fromParams;
        }

        // si le précédent state est login, on réinitialise à celui d'avant
        if($rootScope.previousState === "login") {
            $rootScope.previousState = oldPrevState;
            $rootScope.previousStateParams = oldPrevStateParams;
        }
    });
});


app.factory('ProtectRoute', function($q, $timeout, $state, Auth, Permission, $stateParams, Toast) {
    var service = {};

    service.slugNotEmpty = function () {
        var def = $q.defer();

        if ($stateParams.slug === "") {
            $timeout(function () {
                $state.go('home')
            });
            def.reject();
        }
        else {
            def.resolve();
        }

        return def.promise;
    };

    service.hasWritePerm = function () {
        var def = $q.defer();

        if(!Auth.isAuthenticated()) {
            $timeout(function () {
              $state.go("login");
            });
            def.reject();
        }
        else {
            Permission.hasWritePermission()
                .$promise.then(
                    function() {
                        def.resolve();
                    },
                    function() {
                        def.reject();
                    }
                )
        }

        return def.promise;
    };

    service.hasUpdatePerm = function () {
        var def = $q.defer();

        if(!Auth.isAuthenticated()) {
            $timeout(function () {
              $state.go("login");
            });
            def.reject();
        }
        else {
            Permission.hasUpdatePermission($stateParams.slug)
                .$promise.then(
                    function() {
                        def.resolve();
                    },
                    function() {
                        def.reject();
                    }
                )
        }

        return def.promise;
    };

    service.isAuthenticated = function () {
        var def = $q.defer();

        if(Auth.isAuthenticated()) {
            def.resolve();
        }
        else {
            $timeout(function () {
              $state.go("login");
            });
            def.reject();
        }

        return def.promise;
    };

    service.isNotAuthenticated = function () {
        var def = $q.defer();

        if(Auth.isAuthenticated()) {
            Toast.open("Hey oh, tu es déjà connecté !", 4000);
            $timeout(function () {
                $state.go("home");
            });
            def.reject();
        }
        else {
            def.resolve();
        }

        return def.promise;
    };

    return service;
});

/**
 * Vérifie que le slug n'est pas vide
 *
 * @param $q
 * @param $stateParams
 * @param $state
 * @param $timeout
 * @private
 */


/**
 * Resolve pour permission d'écrire un article
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @param Permission
 * @returns {*}
 * @private
 */


/**
 * Resolve pour permission de modifier un article
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @param Permission
 * @param $stateParams
 * @returns {*}
 * @private
 */

/**
 * Resolve pour vérifier qu'un utilisateur est connecté
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @returns {*}
 * @private
 */
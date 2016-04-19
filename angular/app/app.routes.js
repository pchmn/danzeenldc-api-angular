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
function _hasWritePerm($q, $timeout, $state, Auth, Permission) {
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
}

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
function _hasUpdatePerm($q, $timeout, $state, Auth, Permission, $stateParams) {
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
}

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
function _isAuthenticated($q, $timeout, $state, Auth) {
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
}

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
function _isNotAuthenticated($q, $timeout, $state, Auth, Toast) {
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
}
app.controller('AuthController', function($rootScope, $scope, $location, $state, Auth, Toast) {

    /**
     * Connexion d'un utilisateur
     */
    $scope.login = function(data) {
        Auth.authUser(data)
            .then(
                // success
                function() {
                    if(
                        $rootScope.previousState !== null &&
                        $rootScope.previousState !== "" &&
                        $rootScope.previousState !== "error403" &&
                        $rootScope.previousState !== "error404"
                    ) {
                        $state.go($rootScope.previousState, $rootScope.previousStateParams);
                    }
                    else {
                        $state.go("home");
                    }
                    Toast.open("Bonjour " + $rootScope.session.user.username + " !", 3000);
                },
                function(error) {
                    Toast.open("Erreur de connexion", 3000);
                    $scope.error = error.data;
                }
            );
    };

    /**
     * Déconnexion d'un utilisateur
     */
    $scope.logout = function() {
        Auth.logoutUser();
    }

});

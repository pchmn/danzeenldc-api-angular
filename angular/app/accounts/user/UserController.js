app.controller('UserController', function($scope, $location, $state, Auth, User, Toast) {

    /**
     * Inscription d'un utilisateur
     *
     * @param user
     */
    $scope.register = function(user) {
        if(user.password !== user.password2) {
            Toast.open("Erreur dans l'inscription", 5000);
            $scope.error = {
                password: "Les deux mots de passe sont différents."
            }
        }
        else {
            User.createUser(user)
                .$promise.then(
                    // success
                    function(data) {
                        $location.path("/");
                        Toast.open("Création réussie !", 3000);
                    },
                    // error
                    function(error) {
                        Toast.open("Erreur dans l'inscription", 5000);
                        $scope.error = error.data;
                    }
                );
        }
    }
});
/**
 * Déconnexion de l'utilisateur
 */
app.directive("logout", function(Auth) {
    return {
        restrict: 'A',

        link: function(scope, element, attrs) {
            element.bind('click', function() {
               Auth.logoutUser();
            });
        }
    }
});
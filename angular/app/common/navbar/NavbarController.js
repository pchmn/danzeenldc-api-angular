app.controller('NavbarController', function($scope, $mdSidenav) {

    /*
     * Gère le leftMenu
     */
    $scope.openLeftMenu = function() {
        $mdSidenav('left').toggle();
    };

    $scope.closeLeftMenu = function() {
        $mdSidenav('left').close();
    };

});
app.controller('InfosController', function($scope, $http, Toast) {

    var rankingJson = "/angular/json/ranking_ligue1.json";
    var resultsJson = "/angular/json/last_next_match.json";
    // init scopes
    $scope.smallTab = true;
    $scope.ranking = [];
    $scope.results = [];

    /**
     * Récupère le classement depuis un json
     */
    $scope.getRanking = function() {
        $http.get(rankingJson)
            .then(
                function(response) {
                    $scope.ranking = response.data;
                },
                function(error) {
                    Toast.open("Erreur lors de la récupération du classement", 6000);
                }
            )
    };


    /**
     * Récupère le classement depuis un json
     */
    $scope.getResults = function() {
        $http.get(resultsJson)
            .then(
                function(response) {
                    $scope.results = response.data;
                },
                function(error) {
                    Toast.open("Erreur lors de la récupération des résultats", 6000);
                }
            )
    };


    /**
     * Redimensionne le tableau du classement
     */
    $scope.toggleTab = function() {
        if($scope.smallTab)
            $scope.smallTab = false;
        else
            $scope.smallTab = true;
    };


    $scope.getRanking();
    $scope.getResults();
});

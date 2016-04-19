app.controller('ArticleListController', function($scope, $stateParams, Article, Toast, Auth) {

    // paramètres de la route
    var page = $stateParams.p || 1;
    var order = $stateParams.o || "-date";
    // init scope values
    $scope.articles = [];
    $scope.count = 0;
    $scope.pages = {};
    $scope.order = order;
    $scope.loading = true;

    /**
     * Liste des articles
     *
     * @param page
     * @param order
     */
    $scope.articleList = function(page, order) {
        Article.getArticleList(page, order)
            .$promise.then(
                // success
                function(data) {
                    $scope.articles = data.results;
                    $scope.count = data.count;
                    $scope.pages = data.pages;
                    $scope.loading = false;
                },
                function(error) {
                    Toast.open("Erreur lors de la récupération des articles", 6000);
                    $scope.loading = false;
                }
            );
    };

    /**
     * Refresh les articles selon nouvelle page ou nouvel ordre
     *
     * @param page
     * @param order
     */
    $scope.refresh = function(page, order) {
        $scope.order = order;
        $scope.loading = true;
        // animation de loading
        setTimeout(function(){ $scope.articleList(page, order);}, 200);
    };

    // récupération de la liste la 1ere fois
    $scope.articleList(page, order);

});

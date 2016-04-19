app.controller('CreateArticleController', function($scope, $state, Permission, Article, Toast) {

    // init scope
    $scope.article = {};

    /**
     * Création d'un article
     *
     * @param article
     */
    $scope.createUpdateArticle = function(article) {
        Article.createArticle(article)
            .$promise.then(
                //success
                function(data) {
                    $state.go("articleDetail.views", {slug: data.slug});
                },
                // error
                function(error) {
                    $scope.error = error.data;
                    Toast.open("Erreur lors de la création de l'article", 4000);
                }
            )
    }

});

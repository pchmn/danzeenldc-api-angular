app.controller('UpdateArticleController', function($scope, $stateParams, $state, $sce, Article, Toast) {

    var slug = $stateParams.slug || '';
    // init scope
    $scope.article = {};

    /**
     * Récupère un article
     *
     * @param slug
     */
    $scope.getArticle = function getArticle(slug) {
        Article.getArticleDetail(slug)
            .$promise.then(
                // success
                function(data) {
                    $scope.article = data.article;
                },
                // error
                function(error) {
                    Toast.open("Erreur lors de la récupération de l'article", 4000);
                }
            );
    };

    /**
     * Modifie un article
     *
     * @param article
     */
    $scope.createUpdateArticle = function(article) {
        Article.updateArticle(article)
            .$promise.then(
                //success
                function(data) {
                    $state.go("articleDetail.views", {slug: data.slug});
                },
                // error
                function(error) {
                    $scope.error = error.data;
                    Toast.open("Erreur lors de la modification de l'article", 4000);
                }
            )
    };

    // récupération de l'article à modifier
    $scope.getArticle(slug);

});
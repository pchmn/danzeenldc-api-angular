app.controller('ArticleDetailController', function($scope, $stateParams, $state, $sce, Permission, Article, Comment, Toast) {

    var slug = $stateParams.slug || '';
    // init scopes
    $scope.article = {};
    $scope.forms = {};
    $scope.newComment = {};
    $scope.comments = [];
    $scope.commentsOrder = "-date";
    $scope.commentsCount = 0;
    $scope.commentsPages = {};


    /**
     * Détail d'un article
     *
     * @param slug
     * @param loadComments
     */
    $scope.articleDetail = function(slug, loadComments) {
        Article.getArticleDetail(slug)
            .$promise.then(
                // success
                function(data) {
                    $scope.article = data.article;
                    $scope.article.content = $sce.trustAsHtml($scope.article.content);
                    $scope.hasVoted = data.has_voted;
                    // récupération des commentaires
                    if(loadComments)
                        $scope.articleComments($scope.article.id, 1, $scope.commentsOrder);
                },
                // error
                function(error) {
                    Toast.open("Erreur lors de la récupération de l'article", 4000);
                }
            );
    };

    /**
     * Vote pour un article
     *
     * @param articleId
     * @param vote
     */
    $scope.voteArticle = function(articleId, vote) {
        Article.voteArticle(articleId, vote)
            .$promise.then(
                // success
                function(data) {
                    $scope.articleDetail($scope.article.slug, false);
                },
                // error
                function(error) {
                    Toast.open("Erreur lors du vote", 3000)
                }
            );
    };

    /**
     * Commentaires d'un article
     *
     * @param articleId
     * @param page
     * @param order
     */
    $scope.articleComments = function(articleId, page, order) {
        Comment.getArticleComments(articleId, page, order)
            .$promise.then(
                // success
                function(data) {
                    $scope.comments = data.results;
                    $scope.commentsCount = data.count;
                    $scope.commentsPages = data.pages;
                },
                // error
                function(error) {
                    Toast.open("Erreur lors de la récupération des commentaires", 4000);
                }
            )
    };

    /**
     * Création d'un commentaire
     *
     * @param comment
     */
    $scope.createComment = function(comment) {
        Comment.createComment($scope.article.id, comment)
            .$promise.then(
                // success
                function() {
                    $scope.commentsOrder = "-date";
                    $scope.articleComments($scope.article.id, 1, $scope.commentsOrder);
                    $scope.newComment = {};
                    $scope.forms.commentForm.$setPristine();
                    $scope.forms.commentForm.$setUntouched();
                    Toast.open("Commentaire posté !", 3000);
                },
                // error
                function(error) {
                    Toast.open("Erreur lors de la création du commentaire", 4000);
                }
            )
    };

    /**
     * Refresh les commentaires selon nouvelle page ou nouvel ordre
     *
     * @param page
     * @param order
     */
    $scope.refreshComments = function(page, order) {
        $scope.commentsOrder = order;
        $scope.articleComments($scope.article.id, page, order);
    };

    $scope.voteComment = function(commentId, vote) {
        Comment.voteComment(commentId, vote)
            .$promise.then(
                // success
                function(data) {
                    $scope.articleComments($scope.article.id, $scope.commentsPages.current, $scope.commentsOrder);
                },
                // error
                function(error) {
                    Toast.open("Erreur lors du vote", 3000)
                }
            );
    };

    // récupération de l'article la 1ere fois
    $scope.articleDetail(slug, true);
});

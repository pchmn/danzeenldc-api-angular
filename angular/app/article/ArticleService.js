app.factory('Article', function($resource, $q) {

    var urlArticle = "/api/articles/:slug/";
    var urlVoteArticle = "/api/articles/vote-article/:articleId/";
    var service = {};

    /**
     * Récupère la liste des articles
     *
     * @param page
     * @param order
     * @returns {*}
     */
    service.getArticleList = function(page, order) {
        var articleRes = $resource(urlArticle + "?page=:page&order=:order", {page: page, order: order});

        return articleRes.get();
    };


    /**
     * Récupère le détail d'un article
     *
     * @param slug
     * @returns {*}
     */
    service.getArticleDetail = function(slug) {
        var articleRes = $resource(urlArticle, {slug: slug});

        return articleRes.get();
    };

    /**
     * Crée un article
     *
     * @param article
     * @returns {*}
     */
    service.createArticle = function(article) {
        var articleRes = $resource(urlArticle);

        return articleRes.save(article);
    };

    /**
     * modifie un article
     *
     * @param article
     * @returns {*}
     */
    service.updateArticle = function(article) {
        var articleRes = $resource(urlArticle, {slug: article.slug}, {'update': { method:'PUT' }});

        return articleRes.update(article);
    };

    /**
     * Vote pour un article
     *
     * @param articleId
     * @param vote
     * @returns {*}
     */
    service.voteArticle = function(articleId, vote) {
        var voteRes = $resource(urlVoteArticle, {articleId: articleId});

        return voteRes.save({vote: vote});
    };

    return service;
});


app.factory('Comment', function($resource, $q) {

    var urlComments = "/api/articles/:articleId/comments/";
    var urlVoteComment = "/api/articles/vote-comment/:commentId/";
    var service = {};

    /**
     * Récupère les commentaires d'un article
     *
     * @param articleId
     * @param page
     * @param order
     * @returns {*}
     */
    service.getArticleComments = function(articleId, page, order) {
        var commentRes = $resource(urlComments + "?page=:page&order=:order", {articleId: articleId, page: page, order: order});

        return commentRes.get();
    };

    /**
     * Crée un commentaire
     *
     * @param articleId
     * @param comment
     * @returns {*}
     */
    service.createComment = function(articleId, comment) {
        var commentRes = $resource(urlComments, {articleId: articleId});

        return commentRes.save(comment);
    };

    /**
     * Vote pour un commentaire
     *
     * @param commentId
     * @param vote
     * @returns {*}
     */
    service.voteComment = function(commentId, vote) {
        var voteRes = $resource(urlVoteComment, {commentId: commentId});

        return voteRes.save({vote: vote});
    };

    return service;

});

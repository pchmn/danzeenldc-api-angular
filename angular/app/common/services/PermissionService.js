app.factory('Permission', function($resource, $q, Auth) {

    var urlPerm = "/api/articles/has-perm/";
    var service = {};

    /**
     * Vérifie que l'utilisateur courant a le droit de créer un article
     *
     * @returns {*}
     */
    service.hasWritePermission = function() {
        var resPerm = $resource(urlPerm + 'write-article/');

        return resPerm.save();
    };

    service.hasUpdatePermission = function(slug) {
        var resPerm = $resource(urlPerm + 'edit-article/:slug/', {slug: slug});

        return resPerm.save();
    };

    return service;
});
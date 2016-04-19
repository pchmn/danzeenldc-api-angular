app.factory('User', function($resource, $q) {

    var urlUser = "/api/users/";
    var service = {};

    /**
     * Récupère la liste des utilisateurs
     *
     * @returns {*}
     */
    service.getUserList = function() {
        var userRes = $resource(urlUser);

        return userRes.query();
    };

    /**
     * Récupère un utilisateur
     *
     * @param username
     * @returns {*}
     */
    service.getUser = function(username) {
        var userRes = $resource(urlUser + ":username", {username: username});

        return userRes.get();
    };

    /**
     * Crée un utilisateur
     *
     * @param user
     * @returns {*}
     */
    service.createUser = function(user) {
        var userRes = $resource(urlUser);

        return userRes.save(user);
    };

    return service;
});

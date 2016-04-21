app.factory('HttpErrorInterceptor', function($q, $injector) {

    return {
        'responseError': function(rejection) {
            // $injector.get('$state') pour éviter circular dependency
            if(rejection.status === 401) {
                $injector.get('$state').go("login");
            }
            else if(rejection.status === 404) {
                $injector.get('$state').go("error404");
            }
            else if(rejection.status === 403) {
                $injector.get('$state').go("error403");
            }

            return $q.reject(rejection);
        }
    }

});
var app = angular.module('app', [
    'ngMaterial', 'ngResource', 'ngSanitize',
    'ui.router', 'angular-jwt', 'md.directives', 'ui.tinymce', 'angulartics', 'angulartics.piwik'
]);

/**
 * Configs de base
 */
app
.config(function($urlRouterProvider, $locationProvider, $resourceProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');
    // enlever le # dans les urls
    $locationProvider.html5Mode(true);
    // Laisser le slash final lors des requêtes
    $resourceProvider.defaults.stripTrailingSlashes = false;
    // csrf token pour chaque requête
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    // error interceptor
    $httpProvider.interceptors.push('HttpErrorInterceptor');
})

/**
 * Gère l'envoi du jwt pour chaque requête
 */
.config(function Config($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function(jwtHelper, $http, config, Auth, Session) {

        // pour les fichiers statiques on n'envoie pas le token
        if (config.url.substr(config.url.length - 5) == '.html' ||
            config.url.substr(config.url.length - 5) == '.json' ||
            config.url.substr(config.url.length - 5) == '.css'  ||
            config.url.substr(config.url.length - 5) == '.js') {
          return null;
        }

        // si non connecté on n'envoie pas le token
        if(!Auth.isAuthenticated()) {
            return null;
        }

        if(jwtHelper.isTokenExpired(Session.authToken)) {
            return Auth.refreshAuthToken();
        }

        return Session.authToken;

    };

    $httpProvider.interceptors.push('jwtInterceptor');
});


/**
 * @ngDoc directive
 * @name ng.directive:mdPagination
 *
 * @description
 * A directive to aid in paging large datasets
 * while requiring a small amount of page
 * information.
 *
 * @element EA
 *
 * This is a fork of https://github.com/brantwills/Angular-Paging
 * Credits to brantwills
 *
 */
angular.module('md.directives', []).directive('mdPagination', function() {

    /**
     * The regex expression to use for any replace methods
     * Feel free to tweak / fork values for your application
     */
    var regex = /\{page\}/g;


    /**
     * The angular return value required for the directive
     */
    return {

        // Restrict to elements and attributes
        restrict: 'EA',

        // Assign the angular link function
        link: fieldLink,

        // Assign the angular directive template HTML
        template: fieldTemplate,

        // Assign the angular scope attribute formatting
        scope: {
            page: '=',
            pageCount: '=',
            pagingAction: '&',
            pgHref: '@',
        }
    };


    /**
     * Link the directive to enable our scope watch values
     *
     * @param {object} scope - Angular link scope
     * @param {object} el - Angular link element
     * @param {object} attrs - Angular link attribute
     */
    function fieldLink(scope, el, attrs) {

        // Hook in our watched items
        scope.$watchCollection('[page,pageCount]', function () {
            build(scope, attrs);
        });
    }


    /**
     * Create our template html
     * We use a function to figure out how to handle href correctly
     *
     * @param {object} el - Angular link element
     * @param {object} attrs - Angular link attribute
     */
    function fieldTemplate(el, attrs){
            return   '<ul ng-hide="Hide" class="ul_pagination"> ' +
                            '<li ' +
                                'class="{{Item.liClass}}" ' +
                                'ng-repeat="Item in List"> ' +
                                    '<a ' +
                                        (attrs.pgHref ? 'ng-href="{{Item.pgHref}}" ' : 'href ') +
                                        'ng-class="{active: Item.active, disabled: Item.disabled || Item.active}" ' +
                                        'class="{{Item.aClass}}" ' +
                                        'ng-click="Item.action()" ' +
                                        'ng-bind="Item.value">'+
                                    '</a> ' +
                            '</li>' +
                        '</ul>'
    }


    /**
     * Assign default scope values from settings
     * Feel free to tweak / fork these for your application
     *
     * @param {Object} scope - The local directive scope object
     * @param {Object} attrs - The local directive attribute object
     */
    function setScopeValues(scope, attrs) {

        scope.List = [];
        scope.FirstPrev = [];
        scope.NextLast = [];
        scope.Hide = false;

        scope.page = parseInt(scope.page) || 1;
        scope.adjacent = parseInt(scope.adjacent) || 1;

        scope.pgHref = scope.pgHref || '';

        scope.showFirstLast = evalBoolAttribute(scope, attrs.showFirstLast);
    }


    /**
     * A helper to perform our boolean eval on attributes
     * This allows flexibility in the attribute for strings and variables in scope
     *
     * @param {Object} scope - The local directive scope object
     * @param {Object} value - The attribute value of interest
     */
    function evalBoolAttribute(scope, value){
        return angular.isDefined(value)
            ? !!scope.$parent.$eval(value)
            : false;
    }


    /**
     * Validate and clean up any scope values
     * This happens after we have set the scope values
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} pageCount - The last page number or total page count
     */
    function validateScopeValues(scope, pageCount) {

        // Block where the page is larger than the pageCount
        if (scope.page > pageCount) {
            scope.page = pageCount;
        }

        // Block where the page is less than 0
        if (scope.page <= 0) {
            scope.page = 1;
        }

        // Block where adjacent value is 0 or below
        if (scope.adjacent <= 0) {
            scope.adjacent = 2;
        }

        // Hide from page if we have 1 or less pages
        // if directed to hide empty
        if (pageCount <= 1) {
            scope.Hide = true;
        }
    }


    /**
     * Assign the method action to take when a page is clicked
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} page - The current page of interest
     */
    function internalAction(scope, page) {

        // Block clicks we try to load the active page
        if (scope.page == page) {
            return;
        }

        // Update the page in scope
        scope.page = page;

        // Pass our parameters to the paging action
        scope.pagingAction({
            page: scope.page,
            pageCount: scope.pageCount
        });

        scrollTo(0, 0);
    }


    /**
     * Add the first, previous, next, and last buttons if desired
     * The logic is defined by the mode of interest
     * This method will simply return if the scope.showPrevNext is false
     * This method will simply return if there are no pages to display
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} pageCount - The last page number or total page count
     * @param {string} mode - The mode of interest either prev or last
     */
    function addPrevNext(scope, pageCount, mode) {

        // Ignore there are no pages to display
        if (pageCount < 1) {
            return;
        }

        // Local variables to help determine logic
        var disabled, alpha, beta;

        // Determine logic based on the mode of interest
        // Calculate the previous / next page and if the click actions are allowed
        if (mode === 'prev') {

            disabled = scope.page - 1 <= 0;
            var prevPage = scope.page - 1 <= 0 ? 1 : scope.page - 1;

            // first button
            if(scope.showFirstLast) {
                alpha = {
                    disabled: disabled,
                    action: function () {
                        internalAction(scope, 1);
                    },
                    liClass: 'li_next_prev',
                    aClass: 'link_page material-icons',
                    value: 'first_page',
                    page: 1
                }
            }

            // prev button
            beta = {
                disabled: disabled,
                action: function () {
                    internalAction(scope, prevPage);
                },
                liClass: 'li_next_prev',
                aClass: 'link_page material-icons',
                value: 'chevron_left',
                page: prevPage
            };

            // add first and prev buttons
            if(alpha)
                scope.List.push(alpha);
            scope.List.push(beta);

        } else {

            disabled = scope.page + 1 > pageCount;
            var nextPage = scope.page + 1 >= pageCount ? pageCount : scope.page + 1;

            // next button
            alpha = {
                disabled: disabled,
                action: function () {
                    internalAction(scope, nextPage);
                },
                liClass: 'li_next_prev',
                aClass: 'link_page material-icons',
                value: 'chevron_right',
                page: nextPage
            };

            // last button
            if(scope.showFirstLast) {
                beta = {
                    disabled: disabled,
                    action: function () {
                        internalAction(scope, pageCount);
                    },
                    liClass: 'li_next_prev',
                    aClass: 'link_page material-icons',
                    value: 'last_page',
                    page: pageCount
                }
            }

            // add next and last buttons
            scope.List.push(alpha);
            if(beta)
                scope.List.push(beta);

        }
    }


    /**
     * Adds a range of numbers to our list
     * The range is dependent on the start and finish parameters
     *
     * @param {int} start - The start of the range to add to the paging list
     * @param {int} finish - The end of the range to add to the paging list
     * @param {Object} scope - The local directive scope object
     */
    function addRange(start, finish, scope) {

        // Add our items where i is the page number
        var i = 0;
        for (i = start; i <= finish; i++) {
            scope.List.push({
                value: i,
                active: scope.page == i,
                pgHref: scope.pgHref.replace(regex, i),
                liClass: 'li_page',
                aClass: 'link_page',
                action: function () {
                    internalAction(scope, this.value);
                }
            });
        }
    }


    /**
     * Add Dots ie: 1 2 [...] 10 11 12 [...] 56 57
     * This is my favorite function not going to lie
     *
     * @param {Object} scope - The local directive scope object
     */
    function addDots(scope) {
        scope.List.push({
            value: '...',
            aClass: 'dots',
            disabled: true
        });
    }


    /**
     * Add the first or beginning items in our paging list
     * We leverage the 'next' parameter to determine if the dots are required
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} next - the next page number in the paging sequence
     */
    function addFirst(scope, next) {

        addRange(1, 1, scope);

        // We ignore dots if the next value is 2
        // ie: 1 2 [...] 3 4 5 becomes just 1 2 3 4 5
        if (next != 2) {
            addDots(scope);
        }
    }


    /**
     * Add the last or end items in our paging list
     * We leverage the 'prev' parameter to determine if the dots are required
     *
     * @param {int} pageCount - The last page number or total page count
     * @param {Object} scope - The local directive scope object
     * @param {int} prev - the previous page number in the paging sequence
     */
    // Add Last Pages
    function addLast(pageCount, scope, prev) {

        // We ignore dots if the previous value is one less that our start range
        // ie: 1 2 3 4 [...] 5 6  becomes just 1 2 3 4 5 6
        if (prev != pageCount - 1) {
            addDots(scope);
        }

        addRange(pageCount, pageCount, scope);
    }


    /**
     * The main build function used to determine the paging logic
     * Feel free to tweak / fork values for your application
     *
     * @param {Object} scope - The local directive scope object
     * @param {Object} attrs - The local directive attribute object
     */
    function build(scope, attrs) {

        // Block divide by 0 and empty page size
        if (!scope.pageCount || scope.pageCount <= 0) {
            scope.pageCount = 1;
        }

        // Set the default scope values where needed
        setScopeValues(scope, attrs);

        // Determine the last page or total page count
        var pageCount = scope.pageCount;

        // Validate the scope values to protect against strange states
        validateScopeValues(scope, pageCount);

        // Create the beginning and end page values
        var start, finish;

        // Calculate the full adjacency value
        var fullAdjacentSize = (scope.adjacent * 2) + 2;


        // Add the Next and Previous buttons to our list
        addPrevNext(scope, pageCount, 'prev');

        // If the page count is less than the full adjacent size
        // Then we simply display all the pages, Otherwise we calculate the proper paging display
        if (pageCount <= (fullAdjacentSize + 2)) {

            start = 1;
            addRange(start, pageCount, scope);

        } else {

            // Determine if we are showing the beginning of the paging list
            // We know it is the beginning if the page - adjacent is <= 2
            if (scope.page - scope.adjacent <= 2) {

                start = 1;
                finish = 1 + fullAdjacentSize;

                addRange(start, finish, scope);
                addLast(pageCount, scope, finish);
            }

            // Determine if we are showing the middle of the paging list
            // We know we are either in the middle or at the end since the beginning is ruled out above
            // So we simply check if we are not at the end
            // Again 2 is hard coded as we always display two pages after the dots
            else if (scope.page < pageCount - (scope.adjacent + 2)) {

                start = scope.page - scope.adjacent;
                finish = scope.page + scope.adjacent;

                addFirst(scope, start);
                addRange(start, finish, scope);
                addLast(pageCount, scope, finish);
            }

            // If nothing else we conclude we are at the end of the paging list
            // We know this since we have already ruled out the beginning and middle above
            else {

                start = pageCount - fullAdjacentSize;
                finish = pageCount;

                addFirst(scope, start);
                addRange(start, finish, scope);
            }
        }

        // Add the next and last buttons to our paging list
        addPrevNext(scope, pageCount, 'next');
    }
});

/**
 * Enregistrer le state précédent
 * Pour rediriger après une connexion
 */
app.run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
        var oldPrevState = $rootScope.previousState;
        var oldPrevStateParams = $rootScope.previousStateParams;

        if(fromState.name === "") {
            $rootScope.previousState = toState.name;
            $rootScope.previousStateParams = toParams;
        }
        else {
            $rootScope.previousState = fromState.name;
            $rootScope.previousStateParams = fromParams;
        }

        // si le précédent state est login, on réinitialise à celui d'avant
        if($rootScope.previousState === "login") {
            $rootScope.previousState = oldPrevState;
            $rootScope.previousStateParams = oldPrevStateParams;
        }
    });
});


app.factory('ProtectRoute', function($q, $timeout, $state, Auth, Permission, $stateParams, Toast) {
    var service = {};

    service.slugNotEmpty = function () {
        var def = $q.defer();

        if ($stateParams.slug === "") {
            $timeout(function () {
                $state.go('home')
            });
            def.reject();
        }
        else {
            def.resolve();
        }

        return def.promise;
    };

    service.hasWritePerm = function () {
        var def = $q.defer();

        if(!Auth.isAuthenticated()) {
            $timeout(function () {
              $state.go("login");
            });
            def.reject();
        }
        else {
            Permission.hasWritePermission()
                .$promise.then(
                    function() {
                        def.resolve();
                    },
                    function() {
                        def.reject();
                    }
                )
        }

        return def.promise;
    };

    service.hasUpdatePerm = function () {
        var def = $q.defer();

        if(!Auth.isAuthenticated()) {
            $timeout(function () {
              $state.go("login");
            });
            def.reject();
        }
        else {
            Permission.hasUpdatePermission($stateParams.slug)
                .$promise.then(
                    function() {
                        def.resolve();
                    },
                    function() {
                        def.reject();
                    }
                )
        }

        return def.promise;
    };

    service.isAuthenticated = function () {
        var def = $q.defer();

        if(Auth.isAuthenticated()) {
            def.resolve();
        }
        else {
            $timeout(function () {
              $state.go("login");
            });
            def.reject();
        }

        return def.promise;
    };

    service.isNotAuthenticated = function () {
        var def = $q.defer();

        if(Auth.isAuthenticated()) {
            Toast.open("Hey oh, tu es déjà connecté !", 4000);
            $timeout(function () {
                $state.go("home");
            });
            def.reject();
        }
        else {
            def.resolve();
        }

        return def.promise;
    };

    return service;
});

/**
 * Vérifie que le slug n'est pas vide
 *
 * @param $q
 * @param $stateParams
 * @param $state
 * @param $timeout
 * @private
 */


/**
 * Resolve pour permission d'écrire un article
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @param Permission
 * @returns {*}
 * @private
 */


/**
 * Resolve pour permission de modifier un article
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @param Permission
 * @param $stateParams
 * @returns {*}
 * @private
 */

/**
 * Resolve pour vérifier qu'un utilisateur est connecté
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @returns {*}
 * @private
 */
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

app.config(function($stateProvider) {
    $stateProvider
        .state('articleDetail', {
            abstract: true,
            url: "/article/:slug",
            templateUrl: '/angular/app/article/article.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.slugNotEmpty();
                }]
            },
            controller: 'ArticleDetailController',
            data : { pageTitle: 'Lis attentivement...' }
        })
        .state('articleDetail.views', {
            url: "",
            views: {
                "article_template": {
                    templateUrl: '/angular/app/article/detail/article_detail.html'
                },
                "comments_template": {
                    templateUrl: '/angular/app/article/detail/article_comments.html'
                }
            }
        })
        .state('createArticle', {
            url: "/create-article",
            templateUrl: '/angular/app/article/create_update/create_update_article.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.hasWritePerm();
                }]
            },
            controller: 'CreateArticleController',
            data : { pageTitle: 'Créer un article' }
        })
        .state('updateArticle', {
            url: "/update/:slug",
            templateUrl: '/angular/app/article/create_update/create_update_article.html',
            resolve: {
                protect:  ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.hasUpdatePerm();
                }]
            },
            controller: 'UpdateArticleController',
            authenticate: true,
            data : { pageTitle: 'Modifier l\'article' }
        })
});

app.config(function($stateProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: '/angular/app/accounts/auth/login.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.isNotAuthenticated();
                }]
            },
            controller: 'AuthController',
            data : { pageTitle: 'Connexion' }
        })
        .state('register', {
            url: "/register",
            templateUrl: '/angular/app/accounts/user/register.html',
            resolve: {
                protect: ['ProtectRoute', function(ProtectRoute) {
                    return ProtectRoute.isNotAuthenticated();
                }]
            },
            controller: 'UserController',
            data : { pageTitle: 'Inscription' }
        });
});

/**
 * Resolve pour vérifier qu'un utilisateur n'est pas connecté
 *
 * @param $q
 * @param $timeout
 * @param $state
 * @param Auth
 * @param Toast
 * @returns {*}
 * @private
 */

app.controller('BaseController', function($rootScope, $scope, $mdSidenav, $mdMedia) {

    /**
     * Gère le leftMenu
     */
    $scope.openLeftMenu = function() {
        $mdSidenav('left').toggle();
    };

    $scope.closeLeftMenu = function() {
        $mdSidenav('left').close();
    };


    /**
     * Option pour tinymce editor
     */
    $scope.tinymceOptions = {
        baseURL: '/angular/assets/libs/tinymce-addons',
        selector: 'textarea',
        height: 500,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks fullscreen',
            'insertdatetime media table contextmenu paste'
        ],
        toolbar: 'insertfile undo redo | styleselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | fullscreen',
        language: 'fr_FR',
        content_css: '/angular/assets/css/tinymce/tinymce-content.css'
    };

    if($mdMedia('max-width: 775px')) {
        $scope.tinymceOptions.menubar = false;
    }

});

app.config(function($stateProvider) {
    $stateProvider
        .state('home', {
            url: "/?p&o",
            views: {
                "" : {
                    templateUrl: '/angular/app/home/home.html'
                },
                "article_list@home": {
                    templateUrl: '/angular/app/home/article_list/article_list.html',
                    controller: 'ArticleListController'
                },
                "infos@home": {
                    templateUrl: '/angular/app/home/infos/infos.html',
                    controller: 'InfosController'
                }
            },
            data : { pageTitle: 'Accueil' }
        });
});

app.config(function($stateProvider) {
    $stateProvider
        .state('error404', {
            templateUrl: '/angular/app/errors/404.html',
            data : { pageTitle: 'Oups...' }
        })
        .state('error403', {
            url: "/forbidden",
            templateUrl: '/angular/app/errors/403.html',
            data : { pageTitle: 'Oups...' }
        })
});

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

app.controller('AuthController', function($rootScope, $scope, $location, $state, Auth, Toast) {

    /**
     * Connexion d'un utilisateur
     */
    $scope.login = function(data) {
        Auth.authUser(data)
            .then(
                // success
                function() {
                    if(
                        $rootScope.previousState !== null &&
                        $rootScope.previousState !== "" &&
                        $rootScope.previousState !== "error403" &&
                        $rootScope.previousState !== "error404"
                    ) {
                        $state.go($rootScope.previousState, $rootScope.previousStateParams);
                    }
                    else {
                        $state.go("home");
                    }
                    Toast.open("Bonjour " + $rootScope.session.user.username + " !", 3000);
                },
                function(error) {
                    Toast.open("Erreur de connexion", 3000);
                    $scope.error = error.data;
                }
            );
    };

    /**
     * Déconnexion d'un utilisateur
     */
    $scope.logout = function() {
        Auth.logoutUser();
    }

});

/**
 * Service qui gère les authentifications
 */
app.factory('Auth', function($rootScope, $resource, $http, $q, $state, Session) {

    var urlAuthJwt = "/api/jwt-auth/";
    var urlRefreshJwt = "/api/jwt-refresh/";
    var service = {};

    /**
     * Teste si l'utilisateur est connecté
     */
    service.isAuthenticated = function() {
        return Session.user !== null && Session.authToken !== null && Session.refreshToken;
    };

    /**
     * Authentifie l'utilisateur
     */
    service.authUser = function(data) {
        var loginRes = $resource(urlAuthJwt);
        var def = $q.defer();

        loginRes.save(data)
            .$promise.then(
                // success
                function(response) {
                    Session.setUser(response.user, data.remember_me);
                    Session.setAuthToken(response.token, data.remember_me);
                    Session.setRefreshToken(response.refresh_token, data.remember_me);
                    def.resolve(response);
                },
                // error
                function(error) {
                    Session.destroy();
                    def.reject(error);
                }
            );

        return def.promise;
    };

    /**
     * Rafraichit un token avec le refresh token
     */
    service.refreshAuthToken = function() {

        if(!service.isAuthenticated()) {
            Session.destroy();
            return null;
        }

        var refreshRes = $http({
            url: urlRefreshJwt,
            skipAuthorization: true,
            method: 'POST',
            data: {token: Session.refreshToken}
        });

        return refreshRes.then(
                // success
                function(response) {
                    Session.setAuthToken(response.data.token);
                    return Session.authToken;
                },
                // error
                function(error) {
                    return null;
                }
            );
    };

    /**
     * Déconnecte l'utilisateur
     */
    service.logoutUser = function() {
        Session.destroy();
        $state.go($state.$current, null, { reload: true });
    };

    return service;
});


/**
 * Service qui gère les sessions
 */
app.factory('Session', function() {

    var session = {};

    // instancier les données
    session.user = localStorage.getObject('user') || sessionStorage.getObject('user');
    session.authToken = localStorage.getObject('authToken') || sessionStorage.getObject('authToken');
    session.refreshToken = localStorage.getObject('refreshToken') || sessionStorage.getObject('refreshToken');

    /**
     * Ajoute l'utilisateur à la session
     */
    session.setUser = function(user, rememberMe) {
        session.user = user;
        if(rememberMe)
            localStorage.setObject('user', user);
        else
            sessionStorage.setObject('user', user);
    };

    /**
     * Ajoute le token à la session
     */
    session.setAuthToken = function(authToken, rememberMe) {
        session.authToken = authToken;
        if(rememberMe)
            localStorage.setObject('authToken', authToken);
        else
            sessionStorage.setObject('authToken', authToken);
    };

    /**
     * Ajoute le refresh token à la session
     */
    session.setRefreshToken = function(refreshToken, rememberMe) {
        session.refreshToken = refreshToken;
        if(rememberMe)
            localStorage.setObject('refreshToken', refreshToken);
        else
            sessionStorage.setObject('refreshToken', refreshToken);
    };

    /**
     * Supprime l'utilisateur de la session
     */
    session.deleteUser = function() {
        session.user = null;
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    };

    /**
     * Supprime le token de la session
     */
    session.deleteAuthToken = function() {
        session.authToken = null;
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    };

    /**
     * Supprime le refresh token de la session
     */
    session.deleteRefreshToken = function() {
        session.refreshToken = null;
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
    };

    /**
     * Supprime la session
     */
    session.destroy = function() {
        session.deleteUser();
        session.deleteAuthToken();
        session.deleteRefreshToken();
    };

    return session;

});

/**
 * Ajouter auth et session à $rootScope
 */
app.run(function($rootScope, Auth, Session) {
    $rootScope.auth = Auth;
    $rootScope.session = Session;
    $rootScope.buttonCreateEdit = {};
});

/**
 * Serialise, désérialise les objets en local et session storage
 */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
};

app.controller('UserController', function($scope, $location, $state, Auth, User, Toast) {

    /**
     * Inscription d'un utilisateur
     *
     * @param user
     */
    $scope.register = function(user) {
        if(user.password !== user.password2) {
            Toast.open("Erreur dans l'inscription", 5000);
            $scope.error = {
                password: "Les deux mots de passe sont différents."
            }
        }
        else {
            User.createUser(user)
                .$promise.then(
                    // success
                    function(data) {
                        $location.path("/");
                        Toast.open("Création réussie !", 3000);
                    },
                    // error
                    function(error) {
                        Toast.open("Erreur dans l'inscription", 5000);
                        $scope.error = error.data;
                    }
                );
        }
    }
});
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

/**
 * Fab button pour créer modifier un article
 */
app.directive('createEditButton', function(Auth, Session) {

    return {
        restrict: 'EA',

        link: link,

        template: template,

        scope: {
            articleAuthor: "=?",

        }
    };

    function template(scope, element, attrs) {
        return '<md-button ng-if="Show" class="md-fab red-fab" aria-label="Créer Modifier">' +
                 '<md-tooltip md-direction="left">' +
                    '<span ng-bind="Tooltip"></span>' +
                 '</md-tooltip>' +
                 '<md-icon ng-class="Icon"></md-icon>' +
               '</md-button>'
    }

    function link(scope, element, attrs) {

        scope.$watch('articleAuthor', function() {
            scope.articleAuthor = scope.articleAuthor || null;
            scope.Show = false;
            scope.Tooltip = "";
            scope.Icon = "";

            if(!Auth.isAuthenticated()) {
                scope.Show = false;
                return;
            }

            if(Session.user.is_writer || Session.user.is_admin) {
                scope.Show = true;
            }

            if(scope.articleAuthor !== null) {
                if(scope.articleAuthor === Session.user.username || Session.user.is_admin) {
                    scope.Tooltip = "Modifier l'article";
                    scope.Icon = "fa fa-pencil";
                }
                else {
                    scope.Show = false;
                    return;
                }
            }
            else {
                scope.Tooltip = "Créer un article";
                scope.Icon = "fa fa-plus";
            }
        })
    }

});
/**
 * Déconnexion de l'utilisateur
 */
app.directive("logout", function(Auth) {
    return {
        restrict: 'A',

        link: function(scope, element, attrs) {
            element.bind('click', function() {
               Auth.logoutUser();
            });
        }
    }
});
/**
 * @ngDoc directive
 * @name ng.directive:mdTable
 *
 * @description
 * A directive to make material design table
 *
 * @element EA
 *
 */
angular.module('md.directives').directive('mdTable', function() {

    /**
     *  The angular return value required for the directive
     */
    return {

        restrict: 'EA',

        link: link,

        template: template,

        scope: {
            titles: '=',
            data: '=',
            highlightValue: "@",
            tableClass: "@",
            theme: "@"
        }
    };

    /**
     * The html template
     *
     * @param scope
     * @param element
     * @param attrs
     * @returns {string}
     */
    function template(scope, element, attrs) {
        return  '<table ng-hide="Hide" class="{{TableClass}} {{Theme}}">' +
                    '<thead>' +
                        '<tr>' +
                            '<th ng-repeat="title in Titles"' +
                                'ng-bind="title">' +
                            '</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr ng-repeat="item in List"' +
                            'ng-class="{highlight: isHighlighted(item)}">' +
                            '<td ng-repeat="(key, val) in item"' +
                                'ng-class="getClass(val)"' +
                                'ng-bind="val">' +
                            '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>'
    }

    /**
     * Link the directive to init the scope values
     *
     * @param scope
     * @param element
     * @param attrs
     */
    function link(scope, element, attrs) {

        // load the scope values only when data is loaded
        scope.$watchCollection('[titles,data]', function () {

            scope.Titles = scope.titles || [];
            scope.List = scope.data || [];
            scope.Highlight = scope.highlightValue || '';
            scope.TableClass = scope.tableClass || '';
            scope.Theme = scope.theme || 'light';

            scope.getClass = function(value) {
                return !isNaN(parseFloat(value)) ? "numeric" : "";
            };

            scope.isHighlighted = function(item) {
                return scope.Highlight === '' ? false : containsValue(item, scope.Highlight);
            };

            scope.Hide = scope.Titles.length == 0 || scope.List.length == 0;

        });
    }

    /**
     * Verify if obj contains value
     *
     * @param obj
     * @param value
     * @returns {boolean}
     */
    function containsValue(obj, value) {
        for(var key in obj) {
            if(obj[key] === value) {
                return true;
            }
        }
        return false;
    }

});

app
.directive('fixedWrapper', function() {
    return function(scope, element, attrs) {

        // Get parent elements width and subtract fixed width
        element.css({
            position: "fixed",
            width: element.parent()[0].clientWidth + 'px'
        });

    };
})

.directive("scroll", function () {
    return function(scope, element, attrs) {

        $("md-content#container").on("scroll", function() {
            scope.isScrolled = true;
        });
    };
})

.directive("isScrolledTo", function ($timeout) {
    return {
        scope: {
            value: "=isScrolledTo"
        },

        link: function(scope, element, attrs) {

            scope.value = scope.value || 0.5;
            scope.isScrolled = false;

            $timeout(function() {
                var halfHeightElt = element[0].offsetHeight * scope.value;
                var topElt = element[0].getBoundingClientRect().top;
                var contentWindow = $("md-content#container");

                contentWindow.on("scroll", function() {
                    if($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight()) {
                        scope.$apply(scope.isScrolled);
                    }
                    console.log(scope.isScrolled)
                });
            });
        }
    }
})

/**
 * Changer le titre de la page en fonction de la route
 */
.directive('pageTitle', function($rootScope, $timeout) {
    return {
      link: function(scope, element) {

        var listener = function(event, toState) {

          var title = 'Default Title';
          if (toState.data && toState.data.pageTitle) title = toState.data.pageTitle;

          $timeout(function() {
            element.text(title);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
});
/**
 * @ngDoc directive
 * @name ng.directive:paging
 *
 * @description
 * A directive to aid in paging large datasets
 * while requiring a small amount of page
 * information.
 *
 * @element EA
 *
 */
angular.module('bw.paging', []).directive('paging', function () {


    /**
     * The regex expression to use for any replace methods
     * Feel free to tweak / fork values for your application
     */
    var regex = /\{page\}/g;


    /**
     * The angular return value required for the directive
     * Feel free to tweak / fork values for your application
     */
    return {

        // Restrict to elements and attributes
        restrict: 'EA',

        // Assign the angular link function
        link: fieldLink,

        // Assign the angular directive template HTML
        template: fieldTemplate,

        // Assign the angular scope attribute formatting
        scope: {
            page: '=',
            pageSize: '=',
            total: '=',
            dots: '@',
            ulClass: '@',
            activeClass: '@',
            disabledClass: '@',
            adjacent: '@',
            pagingAction: '&',
            pgHref: '@',
            textFirst: '@',
            textLast: '@',
            textNext: '@',
            textPrev: '@',
            textFirstClass: '@',
            textLastClass: '@',
            textNextClass: '@',
            textPrevClass: '@',
            textTitlePage: '@',
            textTitleFirst: '@',
            textTitleLast: '@',
            textTitleNext: '@',
            textTitlePrev: '@'
        }

    };


    /**
     * Link the directive to enable our scope watch values
     *
     * @param {object} scope - Angular link scope
     * @param {object} el - Angular link element
     * @param {object} attrs - Angular link attribute
     */
    function fieldLink(scope, el, attrs) {

        // Hook in our watched items
        scope.$watchCollection('[page,pageSize,total]', function () {
            build(scope, attrs);
        });
    }


    /**
     * Create our template html
     * We use a function to figure out how to handle href correctly
     *
     * @param {object} el - Angular link element
     * @param {object} attrs - Angular link attribute
     */
    function fieldTemplate(el, attrs){
            return '<ul data-ng-hide="Hide" data-ng-class="ulClass"> ' +
                '<li ' +
                    'title="{{Item.title}}" ' +
                    'data-ng-class="Item.liClass" ' +
                    'data-ng-repeat="Item in List"> ' +
                        '<a ' +
                            (attrs.pgHref ? 'data-ng-href="{{Item.pgHref}}" ' : 'href ') +
                            'data-ng-class="Item.aClass" ' +
                            'data-ng-click="Item.action()" ' +
                            'data-ng-bind="Item.value">'+
                        '</a> ' +
                '</li>' +
            '</ul>'
    }


    /**
     * Assign default scope values from settings
     * Feel free to tweak / fork these for your application
     *
     * @param {Object} scope - The local directive scope object
     * @param {Object} attrs - The local directive attribute object
     */
    function setScopeValues(scope, attrs) {

        scope.List = [];
        scope.Hide = false;

        scope.page = parseInt(scope.page) || 1;
        scope.total = parseInt(scope.total) || 0;
        scope.adjacent = parseInt(scope.adjacent) || 1;

        scope.pgHref = scope.pgHref || '';
        scope.dots = scope.dots || '...';

        scope.ulClass = scope.ulClass || 'pagination';
        scope.activeClass = scope.activeClass || 'active';
        scope.disabledClass = scope.disabledClass || 'disabled';

        scope.textFirst = scope.textFirst || '<<';
        scope.textLast = scope.textLast || '>>';
        scope.textNext = scope.textNext || '>';
        scope.textPrev = scope.textPrev || '<';

        scope.textFirstClass = scope.textFirstClass || '';
        scope.textLastClass= scope.textLastClass || '';
        scope.textNextClass = scope.textNextClass || '';
        scope.textPrevClass = scope.textPrevClass || '';

        scope.textTitlePage = scope.textTitlePage || 'Page {page}';
        scope.textTitleFirst = scope.textTitleFirst || 'First Page';
        scope.textTitleLast = scope.textTitleLast || 'Last Page';
        scope.textTitleNext = scope.textTitleNext || 'Next Page';
        scope.textTitlePrev = scope.textTitlePrev || 'Previous Page';

        scope.hideIfEmpty = evalBoolAttribute(scope, attrs.hideIfEmpty);
        scope.showPrevNext = evalBoolAttribute(scope, attrs.showPrevNext);
        scope.showFirstLast = evalBoolAttribute(scope, attrs.showFirstLast);
        scope.scrollTop = evalBoolAttribute(scope, attrs.scrollTop)
    }


    /**
     * A helper to perform our boolean eval on attributes
     * This allows flexibility in the attribute for strings and variables in scope
     *
     * @param {Object} scope - The local directive scope object
     * @param {Object} value - The attribute value of interest
     */
    function evalBoolAttribute(scope, value){
        return angular.isDefined(value)
            ? !!scope.$parent.$eval(value)
            : false;
    }


    /**
     * Validate and clean up any scope values
     * This happens after we have set the scope values
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} pageCount - The last page number or total page count
     */
    function validateScopeValues(scope, pageCount) {

        // Block where the page is larger than the pageCount
        if (scope.page > pageCount) {
            scope.page = pageCount;
        }

        // Block where the page is less than 0
        if (scope.page <= 0) {
            scope.page = 1;
        }

        // Block where adjacent value is 0 or below
        if (scope.adjacent <= 0) {
            scope.adjacent = 2;
        }

        // Hide from page if we have 1 or less pages
        // if directed to hide empty
        if (pageCount <= 1) {
            scope.Hide = scope.hideIfEmpty;
        }
    }


    /**
     * Assign the method action to take when a page is clicked
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} page - The current page of interest
     */
    function internalAction(scope, page) {

        // Block clicks we try to load the active page
        if (scope.page == page) {
            return;
        }

        // Update the page in scope
        scope.page = page;

        // Pass our parameters to the paging action
        scope.pagingAction({
            page: scope.page,
            pageSize: scope.pageSize,
            total: scope.total
        });

        // If allowed scroll up to the top of the page
        if (scope.scrollTop) {
            scrollTo(0, 0);
        }
    }


    /**
     * Add the first, previous, next, and last buttons if desired
     * The logic is defined by the mode of interest
     * This method will simply return if the scope.showPrevNext is false
     * This method will simply return if there are no pages to display
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} pageCount - The last page number or total page count
     * @param {string} mode - The mode of interest either prev or last
     */
    function addPrevNext(scope, pageCount, mode) {

        // Ignore if we are not showing
        // or there are no pages to display
        if ((!scope.showPrevNext && !scope.showFirstLast) || pageCount < 1) {
            return;
        }

        // Local variables to help determine logic
        var disabled, alpha, beta;

        // Determine logic based on the mode of interest
        // Calculate the previous / next page and if the click actions are allowed
        if (mode === 'prev') {

            disabled = scope.page - 1 <= 0;
            var prevPage = scope.page - 1 <= 0 ? 1 : scope.page - 1;

            if(scope.showFirstLast){
                alpha = {
                    value: scope.textFirst,
                    title: scope.textTitleFirst,
                    aClass: scope.textFirstClass,
                    page: 1
                };
            }

            if(scope.showPrevNext){
                beta = {
                    value: scope.textPrev,
                    title: scope.textTitlePrev,
                    aClass: scope.textPrevClass,
                    page: prevPage
                };
            }

        } else {

            disabled = scope.page + 1 > pageCount;
            var nextPage = scope.page + 1 >= pageCount ? pageCount : scope.page + 1;

            if(scope.showPrevNext){
                alpha = {
                    value: scope.textNext,
                    title: scope.textTitleNext,
                    aClass: scope.textNextClass,
                    page: nextPage
                };
            }

            if(scope.showFirstLast){
                beta = {
                    value: scope.textLast,
                    title: scope.textTitleLast,
                    aClass: scope.textLastClass,
                    page: pageCount
                };
            }

        }

        // Create the Add Item Function
        var buildItem = function (item, disabled) {
            return {
                value: item.aClass ? '' : item.value,
                title: item.title,
                liClass: disabled ? scope.disabledClass : '',
                aClass: item.aClass,
                pgHref: scope.pgHref.replace(regex, item.page),
                action: function () {
                    if (!disabled) {
                        internalAction(scope, item.page);
                    }
                }
            };
        };

        // Add alpha items
        if(alpha){
            var alphaItem = buildItem(alpha, disabled);
            scope.List.push(alphaItem);
        }

        // Add beta items
        if(beta){
            var betaItem = buildItem(beta, disabled);
            scope.List.push(betaItem);
        }
    }


    /**
     * Adds a range of numbers to our list
     * The range is dependent on the start and finish parameters
     *
     * @param {int} start - The start of the range to add to the paging list
     * @param {int} finish - The end of the range to add to the paging list
     * @param {Object} scope - The local directive scope object
     */
    function addRange(start, finish, scope) {

        // Add our items where i is the page number
        var i = 0;
        for (i = start; i <= finish; i++) {
            scope.List.push({
                value: i,
                title: scope.textTitlePage.replace(regex, i),
                liClass: scope.page == i ? scope.activeClass : '',
                pgHref: scope.pgHref.replace(regex, i),
                action: function () {
                    internalAction(scope, this.value);
                }
            });
        }
    }


    /**
     * Add Dots ie: 1 2 [...] 10 11 12 [...] 56 57
     * This is my favorite function not going to lie
     *
     * @param {Object} scope - The local directive scope object
     */
    function addDots(scope) {
        scope.List.push({
            value: scope.dots,
            liClass: scope.disabledClass
        });
    }


    /**
     * Add the first or beginning items in our paging list
     * We leverage the 'next' parameter to determine if the dots are required
     *
     * @param {Object} scope - The local directive scope object
     * @param {int} next - the next page number in the paging sequence
     */
    function addFirst(scope, next) {

        addRange(1, 2, scope);

        // We ignore dots if the next value is 3
        // ie: 1 2 [...] 3 4 5 becomes just 1 2 3 4 5
        if (next != 3) {
            addDots(scope);
        }
    }


    /**
     * Add the last or end items in our paging list
     * We leverage the 'prev' parameter to determine if the dots are required
     *
     * @param {int} pageCount - The last page number or total page count
     * @param {Object} scope - The local directive scope object
     * @param {int} prev - the previous page number in the paging sequence
     */
    // Add Last Pages
    function addLast(pageCount, scope, prev) {

        // We ignore dots if the previous value is one less that our start range
        // ie: 1 2 3 4 [...] 5 6  becomes just 1 2 3 4 5 6
        if (prev != pageCount - 1) {
            addDots(scope);
        }

        addRange(pageCount, pageCount, scope);
    }



    /**
     * The main build function used to determine the paging logic
     * Feel free to tweak / fork values for your application
     *
     * @param {Object} scope - The local directive scope object
     * @param {Object} attrs - The local directive attribute object
     */
    function build(scope, attrs) {

        // Block divide by 0 and empty page size
        if (!scope.pageSize || scope.pageSize <= 0) {
            scope.pageSize = 1;
        }

        // Determine the last page or total page count
        var pageCount = Math.ceil(scope.total / scope.pageSize);

        // Set the default scope values where needed
        setScopeValues(scope, attrs);

        // Validate the scope values to protect against strange states
        validateScopeValues(scope, pageCount);

        // Create the beginning and end page values
        var start, finish;

        // Calculate the full adjacency value
        var fullAdjacentSize = (scope.adjacent * 2) + 2;


        // Add the Next and Previous buttons to our list
        addPrevNext(scope, pageCount, 'prev');

        // If the page count is less than the full adjacent size
        // Then we simply display all the pages, Otherwise we calculate the proper paging display
        if (pageCount <= (fullAdjacentSize + 2)) {

            start = 1;
            addRange(start, pageCount, scope);

        } else {

            // Determine if we are showing the beginning of the paging list
            // We know it is the beginning if the page - adjacent is <= 2
            if (scope.page - scope.adjacent <= 2) {

                start = 1;
                finish = 1 + fullAdjacentSize;

                addRange(start, finish, scope);
                addLast(pageCount, scope, finish);
            }

            // Determine if we are showing the middle of the paging list
            // We know we are either in the middle or at the end since the beginning is ruled out above
            // So we simply check if we are not at the end
            // Again 2 is hard coded as we always display two pages after the dots
            else if (scope.page < pageCount - (scope.adjacent + 2)) {

                start = scope.page - scope.adjacent;
                finish = scope.page + scope.adjacent;

                addFirst(scope, start);
                addRange(start, finish, scope);
                addLast(pageCount, scope, finish);
            }

            // If nothing else we conclude we are at the end of the paging list
            // We know this since we have already ruled out the beginning and middle above
            else {

                start = pageCount - fullAdjacentSize;
                finish = pageCount;

                addFirst(scope, start);
                addRange(start, finish, scope);
            }
        }

        // Add the next and last buttons to our paging list
        addPrevNext(scope, pageCount, 'next');
    }

});

/**
 * @ngDoc directive
 * @name ng.directive:likesDislikesBar
 *
 * @description
 * A directive to make a likes-dislikes bar (like YouTube)
 *
 * @element EA
 *
 */
angular.module('md.directives').directive('likesBar', function() {

    /**
     *  The angular return value required for the directive
     */
    return {

        restrict: 'EA',

        link: link,

        template: template,

        scope: {
            likes: '=',
            dislikes: '=',
            size: '@'
        }
    };


    /**
     * The html template
     *
     * @param scope
     * @param element
     * @param attrs
     * @returns {string}
     */
    function template(scope, element, attrs) {
        return  '<div ng-show="likes > 0 || dislikes > 0" class="div_bar_votes {{Size}}">' +
                    '<div class="bar_votes bar_likes" style="width: {{ likesWidth }}%">' +
                    '</div>' +
                    '<div class="bar_votes bar_dislikes" style="width: {{ dislikesWidth }}%">' +
                    '</div>' +
                '</div>' +
                '<div ng-hide="likes > 0 || dislikes > 0" class="div_bar_votes {{Size}}" style="background: #727272">' +
                '</div>'
    }


    /**
     * Link the directive to init the scope values
     *
     * @param scope
     * @param element
     * @param attrs
     */
    function link(scope, element, attrs) {

        // load the scope values only when data is loaded
        scope.$watchCollection('[likes,dislikes]', function () {

            scope.Likes = scope.likes || 0;
            scope.Dislikes = scope.dislikes || 0;
            scope.Size = scope.size || "mini";

            if(scope.Likes > 0 || scope.Dislikes > 0) {
                scope.likesWidth = (scope.Likes/(scope.Likes+scope.Dislikes))*100;
                scope.dislikesWidth = 100 - scope.likesWidth;
            }
            else {
                scope.likesWidth = 0;
                scope.dislikesWidth = 0;
            }

        });
    }
});
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
/**
 * Tronquer une chaine selon un nombre de caractères
 *
 * from https://github.com/igreulich/angular-truncate
 */
app
.filter('truncate', function () {
    return function (text, length, end){
        if (text !== undefined){
            if (isNaN(length)){
                length = 10;
            }

            end = end || "...";

            if (text.length <= length || text.length - end.length <= length){
                return text;
            }
            else {
                return String(text).substring(0, length - end.length) + end;
            }
        }
    };
})


/**
 * Tronquer une chaine selon un nombre de mots
 */
.filter('truncatewords', function() {
    return function(text, length) {
        if(text !== undefined) {
            var orTab = text.split(" ");

            if(orTab.length <= length) {
                return orTab.join(" ");
            }
            else {
                var tab = orTab.slice(0, length);
                return tab.join(" ") + "...";
            }
        }
    }
})


/**
 * Ajoute un s au mot demandé si la valeur est supérieur à 1
 */
.filter('plural', function() {
    return function(nb, word) {
        if(nb !== undefined) {
            if(nb > 0) {
                return nb + " " + word + "s";
            }
            else if(nb >= 0 && nb < 2) {
                return nb + " " + word;
            }
        }
    }
})


.filter('percentagewidth', function() {
    return function(part, otherpart) {
        if(part !== undefined) {
            return "width:" + (part/(part+otherpart))*100 + "%"
        }
    }
})

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
        $scope.articleList(page, order);
    };

    // récupération de la liste la 1ere fois
    $scope.articleList(page, order);

});

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
app.factory('Toast', function($mdToast, $document) {

    var toast = {};

    toast.open = function(text, delay) {
        $mdToast.show(
            $mdToast.simple()
            .textContent(text)
            .action('Fermer')
            .position("bottom left")
            .hideDelay(delay)
        ).then(function(response) {
          if ( response == 'ok' ) {
            $mdToast.hide();
          }
        });
    }

    return toast;

});

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

/**
 * Theme angular material
 */
app
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('grey');
})

/**
 * Fix floating label
 */
.config(function($provide) {
    $provide.decorator('mdInputContainerDirective', function($delegate, $interval) {
        var directive = $delegate[0];

        directive.compile = function() {
            return {
                post: function($scope, element, attr, ctrl) {
                    var interval;
                    var count = 0;

                    if (ctrl.input[0].type === 'password') {
                        interval = $interval(function() {
                            if (count > 10) {
                                $interval.cancel(interval);
                            }

                            if (ctrl.input.parent()[0].querySelector('input:-webkit-autofill')) {
                                ctrl.element.addClass('md-input-has-value');
                                $interval.cancel(interval);
                            }

                            count++;
                        }, 25);
                    }
                }
            };
        };

        return $delegate;
    });
});
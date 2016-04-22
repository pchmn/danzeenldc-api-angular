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

            if(scope.articleAuthor !== null && scope.articleAuthor === Session.user.username ||
               scope.articleAuthor !== null && Session.user.is_admin)
            {
                scope.Tooltip = "Modifier l'article";
                scope.Icon = "fa fa-pencil";
            }
            else {
                scope.Tooltip = "Créer un article";
                scope.Icon = "fa fa-plus";
            }
        })
    }

});
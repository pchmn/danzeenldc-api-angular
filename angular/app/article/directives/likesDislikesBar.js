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
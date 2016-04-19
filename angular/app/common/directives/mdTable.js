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

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
                                        'ng-click="Item.action()" >' +
                                        '<span ng-if="Item.liClass !== \'li_next_prev\'" ng-bind="Item.value"></span>' +
                                        '<i ng-if="Item.liClass === \'li_next_prev\'" class="fa" ng-class="Item.value"></i>' +
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
                    value: '&#xE5DC;', // first_page
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
                value: 'fa-angle-left',
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
                value: 'fa-angle-right',
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
                    value: '&#xE5DD;', // last_page
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

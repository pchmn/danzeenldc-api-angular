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
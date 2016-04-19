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
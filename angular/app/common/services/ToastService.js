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

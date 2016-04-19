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

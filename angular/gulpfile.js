var gulp = require('gulp'),
    less = require('gulp-less'),
    cleanCSS = require('gulp-clean-css'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    order = require("gulp-order"),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload');

/**
 * less to css and minify css
 */
gulp.task('less', function() {
    return gulp.src('./assets/css/main.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./assets/css'))
        .pipe(livereload());
});

gulp.task('js-libs', function() {
   return gulp.src([
       './assets/libs/angular-jwt/angular-jwt.js',
       './assets/libs/angular-ui-router/angular-ui-router.js',
       './assets/libs/angulartics/angulartics.js',
       './assets/libs/angulartics-piwik/angulartics-piwik.js',
       './assets/libs/i18n/angular-locale_fr-fr.js',
       './assets/libs/ui-tinymce/ui-tinymce.js',
       './assets/libs/tinymce/tinymce.js'
        ])
       .pipe(concat('libs.js'))
       .pipe(gulp.dest('./assets/libs'))
});

gulp.task('js-angular', function() {
   return gulp.src([
       './app/app.js',
       './app/common/directives/mdPagination.js',
       './app/**/*.js'
        ])
       .pipe(concat('main.js'))
       .pipe(gulp.dest('./assets/js'))
});

/**
 * livereload
 */
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('./assets/css/**/*.less', ['less']);
    gulp.watch('./app/**/*.js', ['js-angular']);
    //gulp.watch('./assets/libs/**/*.js', ['js-libs']);
    gulp.watch('./**/*.html').on('change', function(file) {
        livereload.changed(file.path);
    });
});

/**
 * default task
 * prepare to prod
 */
gulp.task('default', function() {
    gulp.src('./assets/libs/angular-material/angular-material.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./assets/css'));

    gulp.src('./assets/libs/libs.js')
        .pipe(uglify())
        .pipe(gulp.dest('./assets/libs'));

/*    gulp.src('./assets/js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('./assets/js'));*/
});

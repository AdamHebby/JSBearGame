var gulp = require('gulp');
var pump = require('pump');
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var cssmin = require('gulp-cssmin');

gulp.task('sass', function(){
    return gulp.src(['!_.scss', 'scss/**/*.scss'])
    .pipe(sass())
    .pipe(cssmin())
    .pipe(gulp.dest('css/'));
});

gulp.task('css', function(){
    return gulp.src('scss/**/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest('css/'));
});

gulp.task('js', function(){
    return gulp.src(['!javascript/**/*-min.js', 'javascript/**/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('javascript/'));
});

gulp.task('watch', function(){
    gulp.watch('scss/**/*.scss', ['sass']);
    gulp.watch('scss/**/*.css', ['css']);
    gulp.watch('javascript/*.js', ['js']);
});

gulp.task('build', ['sass', 'css', 'js']);
gulp.task('default', ['build']);

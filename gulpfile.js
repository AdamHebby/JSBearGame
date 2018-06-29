var gulp = require('gulp');
var pump = require('pump');
var sass = require('gulp-sass');
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

gulp.task('watch', function(){
    gulp.watch('scss/**/*.scss', ['sass']);
    gulp.watch('scss/**/*.css', ['css']);
});

gulp.task('build', ['sass', 'css']);
gulp.task('default', ['build']);

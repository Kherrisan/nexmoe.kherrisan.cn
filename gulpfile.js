var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
let babel = require('gulp-babel');

// 压缩html
gulp.task('minify-html', function() {
    return gulp.src('./docs/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        }))
        .pipe(gulp.dest('./docs'))
});
// 压缩css
gulp.task('minify-css', function() {
    return gulp.src('./docs/**/*.css')
        .pipe(minifycss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./docs'));
});
// 压缩js
gulp.task('minify-js', function() {
    return gulp.src('./docs/js/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./docs/js'));
});
// 默认任务
gulp.task('default', gulp.parallel(
    'minify-html','minify-css','minify-js'
));
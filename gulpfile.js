var gulp = require('gulp');
var fs = require('hexo-fs');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var request = require('sync-request');
var htmlclean = require('gulp-htmlclean');
let babel = require('gulp-babel');
var isUrl = require('is-url');
var replace = require('gulp-replace');
var path = require('path');
const { series } = require('gulp');

var CACHE = {};
var EXCLUDES = ['animation.js', 'MathJax', 'fontawesome', 'lightgallery'];

function inline(raw, inlineOpen, inlineClose) {
    return replace(raw, function (match, src, offset, string) {
        for (ex of EXCLUDES) {
            if (src.indexOf(ex) != -1) {
                console.debug("ignore " + src)
                return match
            }
        }
        if (isUrl(src)) {
            try {
                var cached = CACHE[src];
                if (!cached) {
                    console.debug("get " + src + " from remote")
                    var res = request('GET', addhttp(src));
                    cached = res.body.toString();
                    if (!cached) {
                        return match;
                    }
                    CACHE[src] = cached;
                }
                return inlineOpen + cached + inlineClose;
            } catch (e) {
                return match
            }
        } else {
            if (src.indexOf('?') != -1) {
                src = src.substring(0, src.indexOf('?'));
            }
            var local_path = path.join('docs', src);
            var cached = CACHE[local_path];
            var file_exists = true;
            if (!cached) {
                try {
                    var file_exists = fs.existsSync(local_path);
                    if (file_exists) {
                        console.debug("get " + src + " from local fs")
                        var cached = fs.readFileSync(local_path);
                        CACHE[local_path] = cached;
                    }
                } catch (err) {
                    file_exists = false;
                }
            }
            if (file_exists) {
                return inlineOpen + cached + inlineClose;
            } else {
                console.debug(local_path + " doesn't exist locally")
                return match
            }
        }
    })
}

function addhttp(url) {
    if (!/^(?:f|ht)tps?\:/.test(url)) {
        url = "http:" + url;
    }
    return url;
}

function replaceOssUrl() {
    return replace(/https:\/\/oss\.kherrisan\.cn(\/(\w|\/)+?\.(png|jpg|jpeg|webp|gif))/g, (match, img) => {
        return '/images' + img;
    });
}

// 压缩html
gulp.task('minify-html', function () {
    return gulp.src('./docs/**/*.html')
        //内联 js 文件
        .pipe(inline(/<script.+?src="(.+?\.js.*?)".*?><\/script>/g, '<script type="text/javascript">', '</script>'))
        //内联 css 文件
        .pipe(inline(/<link rel="stylesheet" href="(.+?\.css.*?)">/g, '<style type="text/css">', '</style>'))
        //替换所有 oss url 为本域名下的路径
        .pipe(replaceOssUrl())
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs'))
});

// 压缩css
gulp.task('minify-css', function () {
    return gulp.src('./docs/**/*.css')
        .pipe(minifycss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./docs'));
});

// 压缩js
gulp.task('minify-js', function () {
    return gulp.src('./docs/js/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./docs/js'));
});

// 默认任务
gulp.task('default', gulp.series(
    gulp.parallel('minify-js', 'minify-css'), 'minify-html'
));
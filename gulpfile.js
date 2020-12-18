const {src, dest, series, parallel} = require('gulp');
const del = require('del');
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

//clean Task
function cleanTask() {
    return del('dist/');
}

//html Task
function htmlTask() {
    return src('src/*.html')
    .pipe(dest('dist/'))
}

//stles Task
function stylesTask() {
    return src('src/styles/*.css')
    .pipe(csso())
    .pipe(concat('all.css'))
    .pipe(dest('dist/styles/'))
}

//script Task
function scriptsTask() {
    return src('src/scripts/*.js')
    .pipe(uglify())
    .pipe(concat('all.js'))
    .pipe(dest('dist/scripts/'))
}

exports.clean = cleanTask;
exports.html = htmlTask;
exports.styles = stylesTask;
exports.scripts = scriptsTask;
exports.default = series(cleanTask, parallel(htmlTask, stylesTask, scriptsTask))
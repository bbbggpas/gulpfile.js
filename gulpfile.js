var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssdeclsort = require('css-declaration-sorter');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

// Sassファイルのコンパイル
gulp.task('sass', function () {
  return gulp.src('./public/sass/**/*.scss')
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssdeclsort({ order: 'alphabetical' })]))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.reload({stream: true}));
});

// Nodemonタスク:
// nodemonを一度起動して、コールバックを実行する
gulp.task('nodemon', callback => {
  let started = false;
  return nodemon({
    script: 'app.js'
  }).on('start', () => {
    if (!started) {
      callback();
      started = true;
    }
  });
});

// BrowserSyncタスク:
// nodemonを呼び出し、コールバック関数として渡す
gulp.task(
  'browser-sync',
  gulp.series('nodemon', () => {
    browserSync.init(null, {
      files: ['public/**/*.*', 'views/**/*.*'],
      proxy: 'http://localhost:3000',
      port: 4000
    });
  })
);

gulp.task('browser-reload', function (done) {
  browserSync.reload();
  done();
});

// ファイルの更新監視
gulp.task('watch', function() {
  gulp.watch('./public/sass/**/*.scss', gulp.task('sass'));
  // gulp.watch('./public/css/**/*.css', gulp.task('browser-reload'));
  gulp.watch('./public/js/**/*.js', gulp.task('browser-reload'));
  gulp.watch('./views/**/*.ejs', gulp.task('browser-reload'));
});

// 「gulp」コマンドのみで実行するタスク
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch')));

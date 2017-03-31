'use strict';

// require modules
var gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  // js
  modernizr = require('gulp-modernizr'),
  eslint = require('gulp-eslint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  babel = require('gulp-babel');


// load config from file
var config = {
  js: {
    src: [
      "plugins/**/*.js",
      "!plugins/**/*.min.js",
      "drupal-behaviors/**/*.js"
    ]
  }
};


//
gulp.task('modernizr', function () {
  // drupal 8 defaults
  gulp.src(config.js.src)
    .pipe(modernizr(
      'modernizr.custom.js',
      {
        options: [
          'setClasses',
          'addTest',
          'prefixes',
          'testStyles'
        ],
        tests:   [
          'touchevents'
        ]
      }
    ))
    .pipe(gulp.dest('lib'));
});


// De-lint the custom js files
gulp.task('lint', function () {
  return gulp.src(config.js.src)
    .pipe(eslint({
      globals: [
        'Drupal',
        'Modernizr',
        'jQuery'
      ]
    }))
    .pipe(eslint.format('stylish'));
});


// General / default
gulp.task('test', ['lint']);


// uglify
gulp.task('uglify', function () {
  return gulp.src(['plugins/**/*.js', '!plugins/**/*.min.js'])
    .pipe(babel({presets: ['es2015']}))
    .pipe(uglify())
    .on('error', function (err) {
      console.error('Error in compress task', err.toString());
    })
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('plugins'));
});


// Static Server + watching js files
gulp.task('default', ['modernizr', 'test', 'uglify'], function () {
  // use proxy to work in a theme
  browserSync.init({
    server: {
      baseDir: "./"
    },
    open:   false,
    notify: false
  });

  // gulp.watch(config.js.src, ['modernizr', 'lint', 'uglify']);
  // temp
  gulp.watch(config.js.src, ['modernizr'])
    .on('change', function (e) {
      gulp.src(e.path)
        .pipe(eslint({
          globals: [
            'Drupal',
            'Modernizr',
            'jQuery'
          ]
        }))
        .pipe(eslint.format('stylish'));
    });

  gulp.watch([config.js.src, '**/*.html'])
    .on('change', browserSync.reload);
});

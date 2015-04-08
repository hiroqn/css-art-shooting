'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require('path');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('styles', function () {
  return gulp.src('app/*.less')
    .pipe($.less({
      paths: ['app']
    }))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('dist'));
});

gulp.task('jade', function () {
  return gulp.src('app/index.jade')
    //.pipe($.changed('app', {extension: '.jade'}))
    .pipe($.jade({
      locals: {}
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['jade', 'styles'], function (cb) {
  browserSync({
    files: '{.tmp,dist}/**/*',
    server: {
      baseDir: ['dist']
    },
    open: true
  }, cb);
  gulp.watch(['app/**/*.jade'], ['jade',  browserSync.reload]);
  gulp.watch(['app/**/*.less'], ['styles', browserSync.reload]);
});


// Deployment to GitHub using git.
gulp.task('deploy', ['default'], function (done) {
  // runSequence('deploy:commit', 'deploy:push', done);
});

// Commit changes to production build locally.
gulp.task('deploy:commit', function (done) {
  var msg, im = process.argv.indexOf('-m');
  if (im >= 0) {
    msg = process.argv.slice(im, im + 2)[1];
  }
  msg = msg || 'Production build';
  var cmd = ["git add .", "git commit -m '" + msg + "'", "git status"];
  exec(cmd.join(' && '), {cwd: path.join(process.cwd(), 'dist')}, function (err, stdout, stderr) {
    if (!/working directory clean/m.test(stdout)) {
      console.log('--- ERROR log ---\n' + stderr);
      console.log('--- STDOUT log ---\n' + stdout);
      throw err || new Error('deploy:commit');
    }
    done();
  });
});

// Push changes to remote (actual deployment).
gulp.task('deploy:push', function (done) {
  var cwd = path.join(process.cwd(), 'dist');
  var args = ['push', '-u', 'origin', 'gh-pages'];
  spawn('git', args, {cwd: cwd, stdio: 'inherit'}).on('close', function (code) {
    if (code !== 0) {
      throw new Error('deploy:push exit code is ' + code);
    }
    done();
  });
});

gulp.task('default', ['jade', 'styles'], function (cb) {
  cb();
});

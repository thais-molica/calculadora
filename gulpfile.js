/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.gulp
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var rename = require('gulp-rename');

var $ = require('gulp-load-plugins')(); //Carrega plugins do gulp dinâmicamente
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var version = require("./app/version.json");

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

//Task de deploy
gulp.task( 'deploy',['default'],function(){
  return gulp.src([
    'dist/**'
  ])
  .pipe( $.ftp({
    host: "",
    port: 21, // defaults to 21 
    user: "", // defaults to "anonymous" 
    pass: "", // defaults to "@anonymous" 
    remotePath: ""
  }))
  .pipe($.util.noop());
});

//Task para minificar JS
gulp.task( 'minifyjs', function(){
  return gulp.src(['app/js/**/*.js','!app/js/**/*.min.js'])
  .pipe($.uglify())
  .pipe($.rename(function(path){
    path.basename += "-" + version.v;
    path.extname = ".min.js";
  }))
  .pipe(gulp.dest('build/js'))
  .pipe(gulp.dest('dist/js'))
});

//Task para compilar CSS e minificar CSS
gulp.task( 'minifycss', function(){
  return gulp.src(['app/css/*.styl'])
  .pipe($.stylus())
  .pipe($.csso())
  .pipe($.rename(function(path){
    path.basename = "app-" + version.v;
    path.extname = ".min.css";
  }))
  .pipe(gulp.dest('dist/css'))
});

//Compila o Stylus para CSS
gulp.task( 'compilecss', function(){
  return gulp.src(['app/css/*.styl'])
  .pipe($.stylus())
  .pipe(gulp.dest('app/css'))
});

//Task para minificar HTML
gulp.task( 'minifyhtml', function(){
  var css = "css/app-" + version.v + ".min.css";
  var js = "js/app-" + version.v + ".min.js";
  var manifest = '<html class="no-js" lang="" manifest="calculadora.appcache">';
  
  return gulp.src('app/**/*.html')
  .pipe($.htmlReplace({

      'replace-css': css,
      'replace-js': js,
      'replace-manifest': manifest
  }))
  .pipe($.minifyHtml())
  .pipe(gulp.dest('dist'))
});

//Task para otimizar imagens
gulp.task('images', function () {
  return gulp.src(['app/*.png'])
    .pipe($.size({title: 'pre-images'}))
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'post-images'}));
});

//Task para copiar os arquivos que não passam por nenhum tipo de processamento
//para a pasta 'dist'
gulp.task('copy',['copymin'],function(){
  return gulp.src([
    'app/*',
    '!app/*.html',
    '!app/*.png',
    '!app/*.appcache'
  ],{
      dot: true
  })
  .pipe(gulp.dest('dist'))
});

gulp.task('copymin',function(){
    return gulp.src([
    'app/css/*.min.css',
    'app/js/*.min.js',
  ],{
      dot: true
  })
  .pipe($.if('*.min.css', gulp.dest('dist/css')))
  .pipe($.if('*.min.js', gulp.dest('dist/js')))
});

//Gera o arquivo de manifest atualizado
gulp.task('manifest',function(){
  var css = "css/app-" + version.v + ".min.css";
  var js = "js/app-" + version.v + ".min.js";
  var text = css + "\n" + js;
  var regex = new RegExp('#replace-begin([^&]+)#replace-end','i');

  return gulp.src(['app/calculadora.appcache'])
  .pipe($.replace(regex, text))
  .pipe(gulp.dest('dist'))
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist','build']));

// Watch Files For Changes & Reload
gulp.task('serve',['compilecss'],function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ["app","build"]
    },

  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/css/**/*.{styl,css}'],['compilecss',reload]);
  gulp.watch(['app/js/**/*.js'],reload);
  gulp.watch(['app/img/**/*'], reload);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(['images','minifyjs','minifycss','minifyhtml','copy','manifest'], cb);
});

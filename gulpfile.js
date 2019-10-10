var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var filelist = require('gulp-filelist');
var fs 			= require('fs');
var	sass    = require('gulp-sass');
var connect = require('gulp-connect');
var	plumber = require('gulp-plumber');
var concat  = require('gulp-concat');
var rename  = require('gulp-rename');
var clean   = require('gulp-clean-css');
var uglify  = require('gulp-uglify');
var autoprefixer  = require('gulp-autoprefixer');

gulp.task('connect', function() {
  connect.server({
    port: 8080
  });
});

var vendorStyles = [
  'node_modules/bootstrap/dist/css/bootstrap.min.css'
 ];

 var vendorScripts = [
  'node_modules/jquery/dist/jquery.js',
  'node_modules/popper.js/dist/umd/popper.min.js',
  'node_modules/bootstrap/dist/js/bootstrap.min.js'
 ];

 gulp.task('styles-combine', function() {
   gulp.src(vendorStyles)
   .pipe(plumber())
   .pipe(concat('vendors.min.css'))
   .pipe(clean())
   .pipe(gulp.dest('assets/css'));
 });

 gulp.task('scripts-combine', function() {
   gulp.src(vendorScripts)
   .pipe(plumber())
   .pipe(concat('vendors.min.js'))
   .pipe(uglify())
   .pipe(gulp.dest('assets/js'));
 });

gulp.task('styles', function() {
  gulp.src('src/sass/styles.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(gulp.dest('assets/css'))
  .pipe(sass({outputStyle: 'compressed'}))
  .pipe(rename('styles.min.css'))
  .pipe(gulp.dest('assets/css'));
});

gulp.task('scripts', function() {
  gulp.src('src/js/scripts.js')
  .pipe(plumber())
  .pipe(gulp.dest('assets/js'))
  .pipe(uglify())
  .pipe(rename('scripts.min.js'))
  .pipe(gulp.dest('assets/js'));
});

gulp.task('scripts-page', function() {
  gulp.src('src/js-page/*.js')
  .pipe(plumber())
  .pipe(gulp.dest('assets/js'))
  .pipe(uglify())
  .pipe(gulp.dest('assets/js'));
});

gulp.task('html', function() {
  gulp.src('*.html')
  .pipe(plumber());
});

gulp.task("createFileIndex", function(){
		gulp.src(['./src/*.*'])
      .pipe(filelist('filelist.json', { flatten: true, removeExtensions: true }))
      .pipe(gulp.dest("./"));
});

gulp.task("watch", function() {
	gulp.watch('src/*.hbs',{cwd:'./'}, ['createFileIndex']);
	gulp.watch('src/**/*.hbs',{cwd:'./'}, ['compile']);
	gulp.watch('filelist.json',{cwd:'./'},['compile']);
	gulp.watch(['*.html'], ['html']);
  gulp.watch(['src/sass/**/*.scss'], ['styles']);
  gulp.watch(['src/js-page/*.js'], ['scripts-page']);
  gulp.watch(['src/js/scripts.js'], ['scripts']);
  gulp.watch(['src/pug/**/*.pug'], ['views']);
});

gulp.task('compile', function () {
	var templateList = JSON.parse(fs.readFileSync("./filelist.json", "utf8"));
	var templateData = {
		title: 'MRO Finder',
		desc: 'We Match AIRCRAFT OPERATORS With MRO and Other AIRCRAFT Service Providers',
		templates: templateList
	},
	options = {
		ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
		batch : ['./src/partials'],
		helpers : {
			capitals : function(str){
				return str.toUpperCase();
			}
		}
	}
	var doAllTemplates = function() {
		for (var i = 0; i <  templateList.length; i++) {
			compileTemplate(templateList[i]);
		}
	}
	var compileTemplate = function(templateName) {
		return gulp.src('src/' + templateName + '.hbs')
			.pipe(handlebars(templateData, options))
			.pipe(rename(templateName + '.html'))
			.pipe(gulp.dest(''));
	}
	doAllTemplates();
});
gulp.task('combine', gulp.series('styles-combine', 'scripts-combine'));

gulp.task('default', gulp.series('connect', 'styles', 'scripts-page', 'scripts', 'html', 'compile', 'watch'));
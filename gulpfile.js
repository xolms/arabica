'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    concat         = require('gulp-concat'),
    bulkSass = require('gulp-sass-bulk-import'),
    jade = require('gulp-jade'),
    cache = require('gulp-cache'),
    bourbon = require('node-bourbon'),
    ftp = require('vinyl-ftp'),
    sassImport 	= require('gulp-sass-import'),
    notify = require("gulp-notify"),
    browserSync = require("browser-sync"),
    mainBowerFiles = require('main-bower-files'),
    jadeGlobbing  = require('gulp-jade-globbing'),
    reload = browserSync.reload;


var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/style/',
        img: 'build/img/',
        fonts: 'build/fonts/',
				libs: 'build/libs'
    },
    src: {
        jade: 'src/*.jade',
        jademixins: 'src/jade/mixins/**/*.jade',
        js: 'src/js/main.js',
		jslibs: 'src/js/libs/*.js',
        style: 'src/style/styles.sass',
		stylecomp: 'src/libs/**/*.css',
		jscomp: 'src/libs/**/*.js',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        jade: 'src/jade/**/*.jade',
        index: 'src/*.jade',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.sass',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
				libs: 'src/libs/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 3001,
    logPrefix: "Frontend_Devil"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.jade)
        .pipe(jadeGlobbing().on("error", notify.onError()))
        .pipe(jade({pretty: true}).on("error", notify.onError()))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});


gulp.task('js:build', function () {
    gulp.src(path.src.js)
		.pipe(sourcemaps.init())
        .pipe(uglify().on("error", notify.onError()))
		.pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
	gulp.src(path.src.jslibs)
		.pipe(sourcemaps.init())
		.pipe(uglify().on("error", notify.onError()))
		.pipe(sourcemaps.write())
		.pipe(concat('libs.js'))
      	.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream: true}));

});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(bulkSass())
        .pipe(sass({
						includePaths: [require('node-bourbon').includePaths, require('bourbon-neat').includePaths],
            outputStyle: 'compressed',
            errLogToConsole: true
        }).on("error", notify.onError()))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));

});
gulp.task('libs', function() {
	gulp.src(path.src.jscomp)
			.pipe(uglify())
			.pipe(concat('components.js'))
      .pipe(gulp.dest(path.build.libs))
			.pipe(reload({stream: true}));
	gulp.src(path.src.stylecomp)
		 	.pipe(cssmin())
		 	.pipe(concat('components.css'))
		  .pipe(gulp.dest(path.build.libs))
      .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
		'libs'
]);


gulp.task('watch', function(){
    watch([path.watch.jade, path.watch.index, path.src.jademixins], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
		watch([path.watch.libs], function(event, cb) {
        gulp.start('libs');
    });
});
gulp.task('imgmin', function(){
	gulp.start('image:build');
});
gulp.task('files', function() {
    gulp.src(mainBowerFiles())
    	.pipe(gulp.dest('src/libs'))
});

gulp.task('default', ['build', 'webserver', 'watch']);

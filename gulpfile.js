var gulp = require("gulp");
var uglify = require("gulp-uglify");
var typescript = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var merge2 = require("merge2");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var cleants = require('gulp-clean-ts-extends');
var changed = require('gulp-changed');
var runSequence = require('run-sequence');
var replace = require("gulp-replace");

var config = require("./config.json");

/*
Compiles all typescript files and creating a declaration file.
*/
gulp.task('typescript-compile', function() {  
  var tsResult = gulp.src(config.core.typescript)
                .pipe(typescript({ 
                    noExternalResolve: true, 
                    target: 'ES6', 
                    declarationFiles: true,
                    typescript: require('typescript')
                }));
    return merge2([
        tsResult.dts
            .pipe(concat(config.build.declarationFilename))
            .pipe(gulp.dest(config.build.outputDirectory)),
        tsResult.js
            .pipe(gulp.dest(config.build.outputDirectory))
    ]);
});

gulp.task("default", ['typescript-compile'], function () {
        gulp.src(config.core.files)
        .pipe(gulp.dest(config.build.outputDirectory));
});

/**
 * Watch task, will call the default task if a ts file is updated.
 */
gulp.task('watch', function() {
  gulp.watch(config.core.typescript, ['default']);
});
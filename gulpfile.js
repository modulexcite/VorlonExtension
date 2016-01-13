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
var zip = require('gulp-zip');

var config = require("./config.json");
var catalog = require("./src/pluginscatalog.json");

/*
Compiles all typescript files and creating a declaration file.
*/
gulp.task('typescript-compile', function() {  
  var tsResult = gulp.src(config.core.typescript)
                .pipe(typescript({ 
                    noExternalResolve: true, 
                    target: 'ES5', 
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

gulp.task("copySource", ['typescript-compile'], function () {
     return gulp.src(config.core.files)
     .pipe(gulp.dest(config.build.outputDirectory));
});

gulp.task("runtime", ['copySource'], function () {
    var pluginsFiles = [
        config.build.outputDirectory + "/vorlonCore/vorlon.tools.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.enums.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.clientMessenger.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.core.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.basePlugin.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.clientPlugin.js"
    ];
    
    for (var index = 0; index < catalog.plugins.length; index++) {
        var pluginFile = config.build.outputDirectory + "/plugins/" + catalog.plugins[index].foldername + "/vorlon." + catalog.plugins[index].foldername + ".client.js";
        
        if (catalog.plugins[index].dependencies) {
            for (var dependenciesIndex = 0; dependenciesIndex < catalog.plugins[index].dependencies.length; dependenciesIndex++) {
                pluginsFiles.push(config.build.outputDirectory + "/plugins/" + catalog.plugins[index].foldername + "/" + catalog.plugins[index].dependencies[dependenciesIndex]);
            }
        }
        
        pluginsFiles.push(pluginFile);
    } 
     
    pluginsFiles.push(config.build.outputDirectory + "/vorlonCore/vorlon.core.client.js");
    
    return gulp.src(pluginsFiles)
    .pipe(concat(config.build.runtimeFilename))        
    .pipe(gulp.dest(config.build.outputDirectory));
});

gulp.task("firefox", ['runtime'], function () {
     return gulp.src(config.build.outputDirectory + '/**/*.*')
     .pipe(zip(config.build.firefoxFilename))
     .pipe(gulp.dest(config.build.outputDirectoryForFirefox));
});

gulp.task("default", ['firefox'], function () {
     console.log("Process done...");
});

/**
 * Watch task, will call the default task if an important file is updated.
 */
gulp.task('watch', function() {
  gulp.watch(config.core.watch, ['default']);
});
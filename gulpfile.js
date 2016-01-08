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

gulp.task("runtime", ['typescript-compile'], function () {
    var pluginsFiles = [
        "dist/vorlonCore/vorlon.tools.js",
        "dist/vorlonCore/vorlon.enums.js",
        "dist/vorlonCore/vorlon.clientMessenger.js",
        "dist/vorlonCore/vorlon.core.js",
        "dist/vorlonCore/vorlon.basePlugin.js",
        "dist/vorlonCore/vorlon.clientPlugin.js"
    ];
    
    for (var index = 0; index < catalog.plugins.length; index++) {
        var pluginFile = "dist/plugins/" + catalog.plugins[index].foldername + "/vorlon." + catalog.plugins[index].foldername + ".client.js";
        
        if (catalog.plugins[index].dependencies) {
            for (var dependenciesIndex = 0; dependenciesIndex < catalog.plugins[index].dependencies.length; dependenciesIndex++) {
                pluginsFiles.push("dist/plugins/" + catalog.plugins[index].foldername + "/" + catalog.plugins[index].dependencies[dependenciesIndex]);
            }
        }
        
        pluginsFiles.push(pluginFile);
    } 
    
    pluginsFiles.push("dist/vorlonCore/vorlon.core.client.js");
    
    gulp.src(pluginsFiles)
    .pipe(concat(config.build.runtimeFilename))        
    .pipe(gulp.dest(config.build.outputDirectory));
});

gulp.task("default", ['runtime'], function () {
        gulp.src(config.core.files)
        .pipe(gulp.dest(config.build.outputDirectory));
});

/**
 * Watch task, will call the default task if a ts file is updated.
 */
gulp.task('watch', function() {
  gulp.watch(config.core.typescript, ['default']);
});
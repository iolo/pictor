module.exports = function (grunt) {
    'use strict';

    require('load-grunt-config')(grunt, {
        data: {
            pkg: grunt.file.readJSON('package.json'),
            env: grunt.option('env') || 'development'
        }
    });

    grunt.registerTask('rsync', function () {
        var done = this.async();
        var rsync_cmdline = 'rsync -az --delete . root@iolo.kr:/var/www/pictor';
        grunt.log.ok(rsync_cmdline);
        require('child_process').exec(rsync_cmdline, function (err, stdout, stderr) {
            if (err) {
                grunt.verbose.writeln(stderr);
                grunt.fail.fatal('rsync failed:' + err);
            } else {
                grunt.verbose.writeln(stdout);
                grunt.log.ok('rsync complete.');
            }
            done(err);
        });
    });

    grunt.event.on('watch', function (action, filepath, target) {
        if (grunt.file.isMatch(grunt.config('watch.copy_public.files'), filepath)) {
            return grunt.config('copy.public.src', [
                filepath.replace(grunt.config('copy.public.cwd'), '')
            ]);
        }
        if (grunt.file.isMatch(grunt.config('watch.jade_public.files'), filepath)) {
            return grunt.config('jade.public.src', [
                filepath.replace(grunt.config('jade.public.cwd'), '')
            ]);
        }
        if (grunt.file.isMatch(grunt.config('watch.less_public.files'), filepath)) {
            return grunt.config('less.public.src', [
                filepath.replace(grunt.config('less.public.cwd'), '')
            ]);
        }
    });
};

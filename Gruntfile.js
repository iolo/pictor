module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        devel: true,
        node: true,
        '-W030': true,//Expected an assignment or function call and instead saw an expression.
        '-W097': true,//Use the function form of "use strict".
        globals: {
        }
      },
      files: ['libs/**/*.js']
    },
    nodeunit: {
      files: ['tests/**/*_test.js']
    },
    apidoc: {
      files: {
        src: 'libs/',
        dest: 'build/apidoc'
      }
    },
    dox: {
      files: {
        src: ['libs/'],
        dest: 'build/dox'
      }
    },
    clean: {
      build: ['build']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-apidoc');
  grunt.loadNpmTasks('grunt-dox');

  grunt.registerTask('rsync', function() {
    var done = this.async();
    var rsync_cmdline = 'rsync -av --delete . root@iolo.kr:/var/www/pictor';
    grunt.log.ok(rsync_cmdline);
    require('child_process').exec(rsync_cmdline, function(err, stdout, stderr) {
      if(err) {
        grunt.verbose.writeln(stderr);
        grunt.fail.fatal('rsync failed:' + err);
      } else {
        grunt.verbose.writeln(stdout);
        grunt.log.ok('rsync complete.');
      }
      done();
    });
  });
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('test', ['nodeunit']);
  grunt.registerTask('build', ['jshint']);
  grunt.registerTask('deploy', ['build', 'rsync']);
};

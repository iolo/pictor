module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        devel: true,
        node: true,
        '-W030': true,//Expected an assignment or function call and instead saw an expression.
        '-W097': true,//Use the function form of 'use strict'.
        globals: {
        }
      },
      libs: ['libs/**/*.js'],
      routes: ['routes/**/*.js'],
      app: ['app/js/**/*.js']
    },
    nodeunit: {
      all: ['tests/**/*_test.js']
    },
    qunit: {
      all: ['tests/**/*_test.html']
    },
    concat: {
      options: {
        separator: ';'
      },
      app: {
        src: ['app/js/**/*.js'],
        dest: 'build/app/js/all.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%=pkg.name%> <%=pkg.version%> (build at ' + (new Date()) + ') */\n'
      },
      app: {
        files: {
          'build/app/js/all.min.js': ['<%=concat.app.dest%>']
        }
      }
    },
    jade: {
      options: {
        pretty: false, // https://github.com/visionmedia/jade/issues/889
        compileDebug: true
      },
      app: {
        expand: true,
        cwd: 'app/',
        src: ['**/*.jade'],
        dest: 'build/app',
        ext: '.html'
      }
    },
    copy: {
      app: {
        expand: true,
        cwd: 'app/',
        src: ['**', '!**/*.jade', '!**/*.coffee', '!**/*.less'],
        dest: 'build/app'
      }
    },
    watch: {
      options: {nospawn: true},
      app: {
        files: ['app/**/*', '!app/**/*.jade', '!app/**/*.coffee', '!app/**/*.less'],
        tasks: ['copy:app']
      },
      jade: {
        files: ['app/**/*.jade'],
        tasks: ['jade:app']
      },
      coffee: {
        files: ['app/**/*.coffee'],
        tasks: ['coffee:app']
      },
      less: {
        files: ['app/**/*.less'],
        tasks: ['less:app']
      }
    },
    apidoc: {
      routes: {
        src: 'routes/',
        dest: 'build/app/docs/api'
      }
    },
    clean: {
      build: ['build']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-apidoc');

  grunt.registerTask('rsync', function() {
    var done = this.async();
    var rsync_cmdline = 'rsync -az --delete . root@iolo.kr:/var/www/pictor';
    grunt.log.ok(rsync_cmdline);
    require('child_process').exec(rsync_cmdline, function(err, stdout, stderr) {
      if(err) {
        grunt.verbose.writeln(stderr);
        grunt.fail.fatal('rsync failed:' + err);
      } else {
        grunt.verbose.writeln(stdout);
        grunt.log.ok('rsync complete.');
      }
      done(err);
    });
  });
  grunt.registerTask('doxx', function() {
    var done = this.async();
    var doxx_cmdline = './node_modules/.bin/doxx --source libs --target build/app/docs/dox';
    require('child_process').exec(doxx_cmdline, function(err, stdout, stderr) {
      if(err) {
        grunt.verbose.writeln(stderr);
        grunt.fail.fatal('doxx failed:' + err);
      } else {
        grunt.verbose.writeln(stdout);
        grunt.log.ok('doxx complete.');
      }
      done(err);
    });
  });
  grunt.registerTask('node', function () {
    grunt.util.spawn({
      cmd: 'node',
      args: ['app.js']
    });
  });
  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['jshint', 'nodeunit', 'qunit']);
  grunt.registerTask('docs', ['doxx', 'apidoc']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'jade', 'copy']);
  grunt.registerTask('deploy', ['build', 'docs', 'rsync']);
  grunt.registerTask('run', ['build', 'node', 'watch']);

  grunt.event.on('watch', function (action, filepath, target) {
    if (grunt.file.isMatch(grunt.config('watch.app.files'), filepath)) {
      var src = filepath.replace(grunt.config('copy.app.cwd'), '');
      grunt.config('copy.app.src', [src]);
    }
    if (grunt.file.isMatch(grunt.config('watch.jade.files'), filepath)) {
      var src = filepath.replace(grunt.config('jade.app.cwd'), '');
      grunt.config('jade.app.src', [src]);
    }
  });
};

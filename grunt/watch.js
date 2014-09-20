module.exports = {
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
};

module.exports = {
    options: {nospawn: true},
    public: {
        files: ['public/**/*', '!public/**/*.jade', '!public/**/*.coffee', '!public/**/*.less'],
        tasks: ['copy:public']
    },
    jade: {
        files: ['public/**/*.jade'],
        tasks: ['jade:public']
    },
    coffee: {
        files: ['public/**/*.coffee'],
        tasks: ['coffee:public']
    },
    less: {
        files: ['public/**/*.less'],
        tasks: ['less:public']
    }
};

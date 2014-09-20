module.exports = {
    options: {
        nospawn: true
    },
    jade_public: {
        files: ['public/**/*.jade'],
        tasks: ['jade:public']
    },
    less_public: {
        files: ['public/**/*.less'],
        tasks: ['less:public']
    },
    copy_public: {
        files: ['public/**/*', '!public/**/*.jade', '!public/**/*.less'],
        tasks: ['copy:public']
    }
};

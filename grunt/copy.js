module.exports = {
    app: {
        expand: true,
        cwd: 'app/',
        src: ['**', '!**/*.jade', '!**/*.coffee', '!**/*.less'],
        dest: 'build/app'
    }
};

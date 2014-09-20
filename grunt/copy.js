module.exports = {
    public: {
        expand: true,
        cwd: 'public/',
        src: ['**', '!**/*.jade', '!**/*.coffee', '!**/*.less'],
        dest: 'build/public'
    }
};
